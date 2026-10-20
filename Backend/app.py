from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import time
import random
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from werkzeug.utils import secure_filename
from datetime import datetime
import requests

app = Flask(__name__)
CORS(app)

# ---------------- PATHS ----------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(BASE_DIR, "bookings.db")
UPLOAD_FOLDER = os.path.join(BASE_DIR, "receipts")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}

# ---------------- HOME ----------------
@app.route("/")
def home():
    return "Twin Scissors Backend Running ✅"

# ---------------- DATABASE ----------------
def init_db():
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    # 🔥 ADD THIS BLOCK
    try:
        c.execute("ALTER TABLE bookings ADD COLUMN duration INTEGER")
    except:
        pass

    try:
        c.execute("ALTER TABLE bookings ADD COLUMN end_time TEXT")
    except:
        pass
  
    c.execute("""
        CREATE TABLE IF NOT EXISTS bookings(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            phone TEXT,
            email TEXT,
            service TEXT,
            price INTEGER,
            date TEXT,
            time TEXT,
            end_time TEXT,
            duration INTEGER,
            status TEXT,
            reference TEXT,
            receipt_path TEXT,
            created_at INTEGER

        )
    """)
    c.execute("""
    CREATE TABLE IF NOT EXISTS blocked_slots(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        time TEXT,
        status TEXT
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS enabled_slots(
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            PRIMARY KEY (date, time)
        )
    """)
    conn.commit()
    conn.close()

init_db()

# ---------------- REFERENCE ----------------
def generate_reference():
    return f"KG-{random.randint(100000, 999999)}"

# ---------------- EMAIL FUNCTIONS ----------------
SENDER_EMAIL = "twinscissors.saloon@gmail.com"
APP_PASSWORD = os.environ.get("SMTP_APP_PASSWORD", "")

def send_booking_email(data, receipt_filename):
    sender_email = "twinscissors.saloon@gmail.com"
    app_password = APP_PASSWORD

    owner_email = "twinscissors.saloon@gmail.com"
    customer_email = data.get("email")

    receipt_link = f"https://twinscissors.pythonanywhere.com/receipts/{receipt_filename}"
    dashboard_link = "https://tharuup.github.io/Twin-Sicissors/"

    # ---------------- CUSTOMER EMAIL ----------------
    customer_html = f"""
    <html>
    <body style="background:#111;padding:40px;font-family:Arial;color:white;">
      <div style="max-width:600px;margin:auto;background:#1a1a1a;padding:30px;border-radius:8px;">
        <h1 style="text-align:center;">TWIN <span style="color:#e10600;">SCISSORS</span></h1>
        <h2 style="color:#e10600;">BOOKING CONFIRMED 🎉</h2>
        <table width="100%" cellpadding="6" style="color:white;">
          <tr><td>Name</td><td align="right"><b>{data.get('name')}</b></td></tr>
          <tr><td>Phone</td><td align="right"><b>{data.get('phone')}</b></td></tr>
          <tr><td>Email</td><td align="right"><b>{data.get('email')}</b></td></tr>
          <tr><td>Service</td><td align="right"><b>{data.get('service')}</b></td></tr>
          <tr><td>Price</td><td align="right"><b>LKR {data.get('price')}</b></td></tr>
          <tr><td>Date</td><td align="right"><b>{data.get('date')}</b></td></tr>
          <tr><td>Time</td><td align="right"><b>{data.get('time')}</b></td></tr>
          <tr><td>Reference</td><td align="right" style="color:#e10600;"><b>{data.get('reference')}</b></td></tr>
        </table>
        <div style="text-align:center;margin-top:25px;">
          <a href="{receipt_link}" style="background:#e10600;color:white;padding:10px 20px;text-decoration:none;">VIEW RECEIPT</a>
        </div>
      </div>
    </body>
    </html>
    """

    # ---------------- OWNER EMAIL ----------------
    owner_html = f"""
    <html>
    <body style="background:#111;padding:40px;font-family:Arial;color:white;">
      <div style="max-width:600px;margin:auto;background:#1a1a1a;padding:30px;border-radius:8px;">
        <h1 style="text-align:center;">TWIN <span style="color:#e10600;">SCISSORS</span></h1>
        <h2 style="color:#e10600;">NEW BOOKING RECEIVED 🔔</h2>
        <table width="100%" cellpadding="6" style="color:white;">
          <tr><td>Name</td><td align="right"><b>{data.get('name')}</b></td></tr>
          <tr><td>Phone</td><td align="right"><b>{data.get('phone')}</b></td></tr>
          <tr><td>Email</td><td align="right"><b>{data.get('email')}</b></td></tr>
          <tr><td>Service</td><td align="right"><b>{data.get('service')}</b></td></tr>
          <tr><td>Price</td><td align="right"><b>LKR {data.get('price')}</b></td></tr>
          <tr><td>Date</td><td align="right"><b>{data.get('date')}</b></td></tr>
          <tr><td>Time</td><td align="right"><b>{data.get('time')}</b></td></tr>
          <tr><td>Reference</td><td align="right" style="color:#e10600;"><b>{data.get('reference')}</b></td></tr>
        </table>
        <div style="text-align:center;margin-top:25px;">
          <a href="{receipt_link}" style="background:#e10600;color:white;padding:10px 20px;text-decoration:none;margin-right:10px;">VIEW RECEIPT</a>
          <a href="{dashboard_link}" style="background:#ffffff;color:black;padding:10px 20px;text-decoration:none;">OPEN ADMIN DASHBOARD</a>
        </div>
      </div>
    </body>
    </html>
    """

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)

        # Send to customer
        msg_customer = MIMEMultipart("alternative")
        msg_customer["From"] = sender_email
        msg_customer["To"] = customer_email
        msg_customer["Subject"] = "Your Booking is Confirmed - Twin Scissors"
        msg_customer.attach(MIMEText(customer_html, "html"))
        server.sendmail(sender_email, customer_email, msg_customer.as_string())

        # Send to owner
        msg_owner = MIMEMultipart("alternative")
        msg_owner["From"] = sender_email
        msg_owner["To"] = owner_email
        msg_owner["Subject"] = "New Booking Received - Twin Scissors"
        msg_owner.attach(MIMEText(owner_html, "html"))
        server.sendmail(sender_email, owner_email, msg_owner.as_string())

        server.quit()
        print("AUTOMATIC EMAILS SENT SUCCESSFULLY")
    except Exception as e:
        print("EMAIL ERROR:", e)

def send_cancel_email(data):
    sender_email = "twinscissors.saloon@gmail.com"
    app_password = APP_PASSWORD

    owner_email = sender_email
    customer_email = data.get("email")

    # ---------------- CUSTOMER CANCEL EMAIL ----------------
    customer_cancel_html = f"""
    <html>
    <body style="background:#111;padding:40px;font-family:Arial;color:white;">
      <div style="max-width:600px;margin:auto;background:#1a1a1a;padding:30px;border-radius:8px;">
        <h1 style="text-align:center;">TWIN <span style="color:#e10600;">SCISSORS</span></h1>
        <h2 style="color:#e10600;">BOOKING CANCELLED ❌</h2>
        <p style="text-align:center;">We're sorry, but your booking has been cancelled.</p>
        
        <table width="100%" cellpadding="6" style="color:white;">
          <tr><td>Name</td><td align="right"><b>{data.get('name')}</b></td></tr>
          <tr><td>Service</td><td align="right"><b>{data.get('service')}</b></td></tr>
          <tr><td>Date</td><td align="right"><b>{data.get('date')}</b></td></tr>
          <tr><td>Time</td><td align="right"><b>{data.get('time')}</b></td></tr>
          <tr><td>Reference</td><td align="right" style="color:#e10600;"><b>{data.get('reference')}</b></td></tr>
        </table>

        <div style="text-align:center;margin-top:25px;color:#888;font-size:13px;">
          If you have any questions or would like to reschedule, please visit our website.
        </div>
      </div>
    </body>
    </html>
    """

    # ---------------- OWNER CANCEL EMAIL ----------------
    owner_cancel_html = f"""
    <html>
    <body style="background:#111;padding:40px;font-family:Arial;color:white;">
      <div style="max-width:600px;margin:auto;background:#1a1a1a;padding:30px;border-radius:8px;">
        <h1 style="text-align:center;">TWIN <span style="color:#e10600;">SCISSORS</span></h1>
        <h2 style="color:#e10600;">BOOKING CANCELLED 🔔</h2>
        
        <table width="100%" cellpadding="6" style="color:white;">
          <tr><td>Name</td><td align="right"><b>{data.get('name')}</b></td></tr>
          <tr><td>Phone</td><td align="right"><b>{data.get('phone')}</b></td></tr>
          <tr><td>Service</td><td align="right"><b>{data.get('service')}</b></td></tr>
          <tr><td>Date</td><td align="right"><b>{data.get('date')}</b></td></tr>
          <tr><td>Time</td><td align="right"><b>{data.get('time')}</b></td></tr>
          <tr><td>Reference</td><td align="right" style="color:#e10600;"><b>{data.get('reference')}</b></td></tr>
        </table>

        <div style="text-align:center;margin-top:25px;">
          <a href="https://tharuup.github.io/Twin-Sicissors/" style="background:#ffffff;color:black;padding:10px 20px;text-decoration:none;font-weight:bold;">
            OPEN ADMIN DASHBOARD
          </a>
        </div>
      </div>
    </body>
    </html>
    """

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_password)

        # Send to customer
        msg_customer = MIMEMultipart("alternative")
        msg_customer["From"] = sender_email
        msg_customer["To"] = customer_email
        msg_customer["Subject"] = "Booking Cancelled - Twin Scissors"
        msg_customer.attach(MIMEText(customer_cancel_html, "html"))
        server.sendmail(sender_email, customer_email, msg_customer.as_string())

        # Send to owner
        msg_owner = MIMEMultipart("alternative")
        msg_owner["From"] = sender_email
        msg_owner["To"] = owner_email
        msg_owner["Subject"] = "Notification: Booking Cancelled"
        msg_owner.attach(MIMEText(owner_cancel_html, "html"))
        server.sendmail(sender_email, owner_email, msg_owner.as_string())

        server.quit()
        print("CANCEL EMAILS SENT SUCCESSFULLY")

    except Exception as e:
        print("CANCEL EMAIL ERROR:", e)

# ---------------- BOOK ----------------
def cleanup_expired_pending():
    conn = sqlite3.connect(DB)
    current_time = int(time.time())
    five_minutes = 5 * 60

    conn.execute("""
        DELETE FROM bookings
        WHERE status='pending_payment'
        AND (? - created_at) > ?
    """, (current_time, five_minutes))

    conn.commit()
    conn.close()

@app.route("/book", methods=["POST"])
def book():
    return jsonify({"error": "Online booking is temporarily paused. Please contact the salon."}), 403

    cleanup_expired_pending()
    try:
        data = request.get_json()

        # 🔥 CHECK WEEKDAY
        booking_date = data.get("date")
        date_obj = datetime.strptime(booking_date, "%Y-%m-%d")

        today = datetime.now().date()
        if date_obj.date() < today:
            return jsonify({"error": "Past dates are not allowed"}), 400

        weekday = date_obj.weekday()
        # Monday = 0
        # Tuesday = 1
        # Wednesday = 2
        # Thursday = 3

        if weekday not in [0,1, 2, 3,4]:
            return jsonify({
                "error": "Bookings are only available Monday to Friday"
            }), 400
        
        booking_time = datetime.strptime(data["time"], "%I:%M %p")

        if weekday == 0:
            if booking_time.hour > 16 or (booking_time.hour == 16 and booking_time.minute > 0):
                return jsonify({
                    "error": "Monday bookings only until 4 PM"
                }), 400

        reference = generate_reference()
        created_time = int(time.time())

        conn = sqlite3.connect(DB)
        c = conn.cursor()

        from datetime import timedelta

        # 🔥 CALCULATE TIME
        duration = data.get("duration") or 60

        start_time = datetime.strptime(data["time"], "%I:%M %p")
        end_time = start_time + timedelta(minutes=duration)

        end_time_str = end_time.strftime("%I:%M %p")

        ''' # Slot lock check
        c.execute(
            "SELECT * FROM bookings WHERE date=? AND time=? AND status='confirmed'",
            (data.get("date"), data.get("time"))
        )
        if c.fetchone():
            conn.close()
            return jsonify({"error": "Slot already booked"}), 400 '''
        
        # 🔥 OVERLAP CHECK
        new_start = data["time"]
        new_end = end_time_str

        c.execute("""
        SELECT time, end_time FROM bookings 
        WHERE date=? AND status='confirmed'
        """, (data["date"],))

        rows = c.fetchall()

        for row in rows:
            existing_start = row[0]
            existing_end = row[1]

            # handle old bookings (no end_time)
            if not existing_end:
                existing_dt = datetime.strptime(existing_start, "%I:%M %p")
                existing_end = (existing_dt + timedelta(minutes=60)).strftime("%I:%M %p")

            s1 = datetime.strptime(new_start, "%I:%M %p")
            e1 = datetime.strptime(new_end, "%I:%M %p")

            s2 = datetime.strptime(existing_start, "%I:%M %p")
            e2 = datetime.strptime(existing_end, "%I:%M %p")

            if s1 < e2 and e1 > s2:
                conn.close()
                return jsonify({"error": "Time overlaps with another booking"}), 400

        # ❌ Check blocked slot
        c.execute(
            "SELECT * FROM blocked_slots WHERE date=? AND time=?",
            (data.get("date"), data.get("time"))
        )

        if c.fetchone():
            conn.close()
            return jsonify({"error": "This slot is disabled by admin"}), 400

      

        c.execute("""
            INSERT INTO bookings
            (name, phone, email, service, price, date, time, end_time, duration, status, reference, created_at)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
        """, (
            data.get("name"),
            data.get("phone"),
            data.get("email"),
            data.get("service"),
            data.get("price"),
            data.get("date"),
            data.get("time"),
            end_time_str,
            duration,
            "pending_payment",
            reference,
            created_time
        ))



        booking_id = c.lastrowid
        conn.commit()
        conn.close()

        return jsonify({
            "message": "Proceed to bank transfer",
            "reference": reference,
            "id": booking_id
        })

    except Exception as e:
        print("BOOK ERROR:", e)
        return jsonify({"error": "Server error"}), 500

# ---------------- GET BOOKINGS ----------------
@app.route("/bookings", methods=["GET"])
def get_bookings():
    cleanup_expired_pending()
    conn = sqlite3.connect(DB)
    
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM bookings ORDER BY date,time").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

# ---------------- GET SLOTS ----------------
@app.route("/slots/<date>", methods=["GET"])
def get_slots(date):
    conn = sqlite3.connect(DB)
    c = conn.cursor()
    c.execute(
        "SELECT time FROM bookings WHERE date=? AND status='confirmed'",
        (date,)
    )
    rows = c.fetchall()
    conn.close()
    return jsonify([r[0] for r in rows])

@app.route("/block-slot", methods=["POST"])
def block_slot():
    data = request.get_json()

    conn = sqlite3.connect(DB)
    c = conn.cursor()

    # prevent blocking booked slot
    c.execute("""
        SELECT * FROM bookings 
        WHERE date=? AND time=? AND status='confirmed'
    """, (data["date"], data["time"]))

    if c.fetchone():
        conn.close()
        return jsonify({"error": "Already booked"}), 400

    c.execute("DELETE FROM enabled_slots WHERE date=? AND time=?", (data["date"], data["time"]))

    # prevent duplicate block
    c.execute("""
        SELECT * FROM blocked_slots WHERE date=? AND time=?
    """, (data["date"], data["time"]))

    if not c.fetchone():
        c.execute("""
        INSERT INTO blocked_slots (date, time, status)
        VALUES (?, ?, 'blocked')
    """, (data["date"], data["time"]))

    conn.commit()
    conn.close()

    return jsonify({"message": "Blocked"})

@app.route("/unblock-slot", methods=["POST"])
def unblock_slot():
    data = request.get_json()

    conn = sqlite3.connect(DB)
    conn.execute(
        "INSERT OR IGNORE INTO enabled_slots (date, time) VALUES (?, ?)",
        (data["date"], data["time"])
    )

    conn.execute("""
        DELETE FROM blocked_slots
        WHERE date=? AND time=?
    """, (data["date"], data["time"]))

    conn.commit()
    conn.close()

    return jsonify({"message": "Unblocked"})

@app.route("/availability/<date>", methods=["GET"])
@app.route("/blocked/<date>", methods=["GET"])
def get_blocked(date):
    conn = sqlite3.connect(DB)
    c = conn.cursor()

    c.execute("SELECT time FROM enabled_slots WHERE date=?", (date,))
    enabled = {row[0] for row in c.fetchall()}
    c.execute("SELECT time FROM blocked_slots WHERE date=?", (date,))
    blocked = {row[0] for row in c.fetchall()}
    slots = [datetime.strptime(f"{hour:02d}:00", "%H:%M").strftime("%I:%M %p")
             for hour in range(9, 23)]
    rows = [(slot,) for slot in slots if slot not in enabled or slot in blocked]

    conn.close()

    return jsonify([r[0] for r in rows])

# ---------------- UPLOAD RECEIPT ----------------
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "pdf"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
@app.route("/upload-receipt/<int:id>", methods=["POST"])
def upload_receipt(id):
    try:
        if "receipt" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["receipt"]

        if file.filename == "":
            return jsonify({"error": "No selected file"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Invalid file type"}), 400

        timestamp = int(time.time())
        filename = f"{id}_{timestamp}_{secure_filename(file.filename)}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        # 🔥 OPEN CONNECTION
        conn = sqlite3.connect(DB)
        conn.row_factory = sqlite3.Row

        # 🔥 Update booking first
        conn.execute(
            """
            UPDATE bookings
            SET receipt_path = ?, status = ?
            WHERE id = ?
            """,
            (filename, "confirmed", id)
        )

        conn.commit()

        # 🔥 Fetch updated row BEFORE closing
        row = conn.execute(
            "SELECT * FROM bookings WHERE id=?",
            (id,)
        ).fetchone()

        conn.close()   # ✅ CLOSE ONLY AFTER EVERYTHING

        if not row:
            return jsonify({"error": "Booking not found"}), 404

        # 🔥 Send email
        try:
            send_booking_email(dict(row), filename)
        except Exception as email_error:
            print("EMAIL FAILED:", email_error)

        return jsonify({"message": "Booking confirmed successfully"})

    except Exception as e:
        print("UPLOAD ERROR:", e)
        return jsonify({"error": "Server crashed"}), 500

# ---------------- SERVE RECEIPTS ----------------
@app.route("/receipts/<filename>")
def uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

# ---------------- ADMIN ACTIONS ----------------
@app.route("/confirm/<int:id>", methods=["POST"])
def confirm_booking(id):
    conn = sqlite3.connect(DB)
    conn.execute(
        "UPDATE bookings SET status='confirmed' WHERE id=?",
        (id,)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Booking confirmed"})


@app.route("/cancel/<int:id>", methods=["POST"])
def cancel_booking(id):

    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    row = conn.execute(
        "SELECT * FROM bookings WHERE id=?",
        (id,)
    ).fetchone()

    if not row:
        conn.close()
        return jsonify({"error": "Not found"}), 404

    conn.execute(
        "UPDATE bookings SET status='cancelled' WHERE id=?",
        (id,)
    )
    conn.commit()
    conn.close()

    # 🔥 Send cancellation email
    try:
        send_cancel_email(dict(row))
    except Exception as email_error:
        print("CANCEL EMAIL FAILED:", email_error)

    return jsonify({"message": "Booking cancelled"})
    return jsonify({"message": "Booking cancelled"})


@app.route("/delete/<int:id>", methods=["POST"])
def delete_booking(id):
    conn = sqlite3.connect(DB)
    conn.execute("DELETE FROM bookings WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Booking deleted"})


@app.route("/clear-all", methods=["POST"])
def clear_all():
    try:
        # Delete DB records
        conn = sqlite3.connect(DB)
        conn.execute("DELETE FROM bookings")
        conn.commit()
        conn.close()

        # Delete receipt files
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)

        return jsonify({"message": "All bookings and receipts cleared"})

    except Exception as e:
        print("CLEAR ALL ERROR:", e)
        return jsonify({"error": "Failed to clear data"}), 500

@app.route("/clear-receipts", methods=["POST"])
def clear_receipts():
    try:
        for filename in os.listdir(UPLOAD_FOLDER):
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            if os.path.isfile(file_path):
                os.remove(file_path)

        return jsonify({"message": "All receipt images deleted"})

    except Exception as e:
        print("CLEAR RECEIPTS ERROR:", e)
        return jsonify({"error": "Failed to delete receipts"}), 500

# ---------------- RUN LOCAL ----------------
if __name__ == "__main__":
    app.run(debug=True)