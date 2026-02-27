import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  ArrowRight,
  Play,
  Menu,
  X,
  Star,
  Instagram,
  Facebook,
  Smartphone,
  Scissors,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  RefreshCw
} from 'lucide-react';

/**
 * TWIN SCISSORS - PREMIUM EDITORIAL PLATFORM
 * Theme: High-Contrast Luxury (Dark Services Merge)
 * Tech: React, Tailwind, Lucide
 * Validation: Strict Phone (10), Name (Text Only), Email
 * Location: Orugodawatta, Colombo 14
 */

// --- Configuration & Content ---
const PHONE_NUMBER = "+94 75 742 3058";
const SUPPORT_EMAIL = "twinscissors.saloon@gmail.com";
const ADDRESS = "Baseline Rd, Orugodawatta, Colombo 01400, Sri Lanka";

const SERVICES = [
  {
    id: 1,
    name: "Signature Haircut",
    price: 2500,
    duration: 45,
    category: "CUTTING",
    img: `${import.meta.env.BASE_URL}images/haircut.jpg`
  },
  {
    id: 2,
    name: "Beard Sculpting",
    price: 1500,
    duration: 30,
    category: "SHAVING",
    img: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    name: "Luxury Therapy",
    price: 3000,
    duration: 40,
    category: "MASSAGE",
    img: `${import.meta.env.BASE_URL}images/massage..jpg`
  },
  {
    id: 4,
    name: "Groom's Ritual",
    price: 12000,
    duration: 150,
    category: "PACKAGE",
    img: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800"
  },
];

const TESTIMONIALS = [
  { name: "Shalika Prasadi", text: "The attention to detail in the haircut was outstanding. The atmosphere is truly premium and the staff are incredibly professional.", role: "Loyal Client" },
  { name: "Kasun Perera", text: "Best barber shop in the area. They understand modern styles perfectly. The hot towel shave is a game changer.", role: "Regular" },
  { name: "Dimuthu Silva", text: "Pixel Crew really did a great job with the booking system. It's so easy to find a slot. The service matches the luxury feel.", role: "Tech Entreprenuer" }
];

// --- Validation Logic ---
const validateIdentity = (data) => {
  const errors = {};
  if (!/^[a-zA-Z\s]*$/.test(data.name) || data.name.trim().length < 3) errors.name = "Invalid name (Letters only)";
  if (!/^\d{10}$/.test(data.phone)) errors.phone = "Phone must be exactly 10 digits";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Invalid email address";
  return errors;
};

// --- Components ---

const Navbar = ({ onBookNow }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-700 ${isScrolled ? 'bg-white/90 backdrop-blur-xl py-3 shadow-sm border-b border-gray-100' : 'bg-transparent py-8'}`}>
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => scrollTo('home')}>
          <div className="flex flex-col">
            <span className={`font-black text-2xl tracking-tighter leading-none transition-colors ${isScrolled ? 'text-black' : 'text-white'}`}>TWIN SCISSORS</span>
            <span className="text-red-600 text-[9px] tracking-[0.5em] font-bold uppercase">Orugodawatta Lounge</span>
          </div>
        </div>

        <div className={`hidden lg:flex gap-12 text-[11px] font-black uppercase tracking-[0.25em] transition-colors ${isScrolled ? 'text-gray-500' : 'text-white/70'}`}>
          {['Home', 'About', 'Services', 'Contact'].map(item => (
            <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="hover:text-red-600 transition-all relative group">
              {item}
              <span className="absolute -bottom-1 left-0 w-0 h-px bg-red-600 transition-all group-hover:w-full"></span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={onBookNow}
            className={`hidden md:block px-8 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${isScrolled ? 'bg-black text-white hover:bg-red-600' : 'bg-white text-black hover:bg-red-600 hover:text-white'}`}
          >
            Book Now
          </button>
          <button className={`${isScrolled ? 'text-black' : 'text-white'} lg:hidden`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden bg-white fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 animate-in fade-in duration-300">
          <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-gray-400"><X size={32} /></button>
          {['Home', 'About', 'Services', 'Contact'].map(item => (
            <button key={item} onClick={() => scrollTo(item.toLowerCase())} className="text-4xl font-black uppercase tracking-tighter">{item}</button>
          ))}
          <button onClick={() => { onBookNow(); setIsOpen(false); }} className="bg-red-600 text-white px-12 py-5 font-black tracking-widest uppercase mt-4">BOOK NOW</button>
        </div>
      )}
    </nav>
  );
};

const BookingModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({ service: null, date: '', slot: '', name: '', phone: '', email: '' });
  const [errors, setErrors] = useState({});
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);
  const slots = ["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM", "05:30 PM"];

  const handleNext = () => {
    if (step === 3) {
      const validationErrors = validateIdentity(bookingData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }
    setErrors({});
    setStep(step + 1);
  };

  const handleRebook = () => {
    setBookingData({ service: null, date: '', slot: '', name: '', phone: '', email: '' });
    setStep(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white w-full max-w-2xl relative rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.25)] animate-in zoom-in-95 duration-500">
        <div className="flex h-[600px]">
          {/* Left Visual Sidebar */}
          <div className="hidden md:block w-1/3 bg-black p-8 text-white relative">
            <div className="h-full flex flex-col justify-between">
              <div>
                <span className="text-red-600 font-black text-[10px] tracking-[0.4em] uppercase block mb-4">Reservation</span>
                <h3 className="text-2xl font-black leading-tight uppercase">Luxury awaits <br />your arrival.</h3>
              </div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">
                {step === 5 ? 'Success' : `Step ${step} of 4`} <br />
                {step === 4 ? 'Payment Gateway' : 'Identity Verification'}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-10 relative flex flex-col">
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-black transition-colors"><X size={20} /></button>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Select Ritual</h2>
                  <div className="space-y-3">
                    {SERVICES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setBookingData({ ...bookingData, service: s }); setStep(2); }}
                        className="w-full flex items-center justify-between p-5 border border-gray-100 rounded-xl hover:border-black hover:shadow-lg transition-all group text-left"
                      >
                        <div className="flex items-center gap-4">
                          <img src={s.img} className="w-12 h-12 object-cover rounded-lg grayscale group-hover:grayscale-0 transition-all" />
                          <div>
                            <p className="font-bold text-xs tracking-widest uppercase">{s.name}</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">LKR {s.price.toLocaleString()} • {s.duration} MINS</p>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-200 group-hover:text-black transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black mb-8 uppercase tracking-tight">Time & Date</h2>
                  <div className="mb-8">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Calendar Selection</label>
                    <input
                      type="date"
                      min={today}
                      className="w-full p-4 border border-gray-100 bg-gray-50 rounded-xl focus:ring-1 focus:ring-black outline-none text-xs font-bold uppercase tracking-widest"
                      onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    />
                  </div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Available Windows</label>
                  <div className="grid grid-cols-2 gap-2">
                    {slots.map(s => (
                      <button
                        key={s}
                        onClick={() => setBookingData({ ...bookingData, slot: s })}
                        className={`p-3 text-[10px] font-bold tracking-widest border rounded-lg transition-all ${bookingData.slot === s ? 'bg-black text-white border-black' : 'hover:border-black border-gray-100 text-gray-500'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Identity</h2>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name (Letters only)</label>
                      <input
                        placeholder="THARUSHA PERERA"
                        value={bookingData.name}
                        className={`w-full p-4 border ${errors.name ? 'border-red-500' : 'border-gray-100'} bg-gray-50 text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-black rounded-xl`}
                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value.replace(/[0-9]/g, '') })}
                      />
                      {errors.name && <p className="text-[9px] text-red-600 font-bold ml-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number (10 Digits)</label>
                      <input
                        placeholder="0751234567"
                        maxLength={10}
                        value={bookingData.phone}
                        className={`w-full p-4 border ${errors.phone ? 'border-red-500' : 'border-gray-100'} bg-gray-50 text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-black rounded-xl`}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value.replace(/\D/g, '') })}
                      />
                      {errors.phone && <p className="text-[9px] text-red-600 font-bold ml-1">{errors.phone}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                      <input
                        placeholder="USER@EMAIL.COM"
                        value={bookingData.email}
                        className={`w-full p-4 border ${errors.email ? 'border-red-500' : 'border-gray-100'} bg-gray-50 text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-black rounded-xl`}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                      />
                      {errors.email && <p className="text-[9px] text-red-600 font-bold ml-1">{errors.email}</p>}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">Payment Gateway</h2>
                  <div className="bg-gray-50 p-6 rounded-2xl mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-black uppercase text-gray-400">Ritual</span>
                      <span className="text-[10px] font-black uppercase tracking-widest">{bookingData.service?.name}</span>
                    </div>
                    <div className="h-px bg-gray-200 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black uppercase">Charge</span>
                      <span className="text-xl font-black tracking-tighter text-red-600 uppercase">LKR {bookingData.service?.price.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-red-50 p-4 rounded-xl text-red-600 mb-8">
                    <ShieldCheck size={24} className="shrink-0" />
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] leading-relaxed">
                      Redirecting to PayHere Secure Gateway. Your slot is locked temporarily for 10 minutes.
                      A confirmation email will be sent upon successful payment.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch("https://formspree.io/f/xlgwvrvk", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                          },
                          body: JSON.stringify({
                            service: bookingData.service?.name,
                            price: bookingData.service?.price,
                            date: bookingData.date,
                            time: bookingData.slot,
                            name: bookingData.name,
                            phone: bookingData.phone,
                            email: bookingData.email
                          })
                        });

                        if (!response.ok) {
                          alert("Payment successful but email failed.");
                          return;
                        }

                        setStep(5); // Only go to success after email sent

                      } catch (error) {
                        alert("Something went wrong.");
                        console.error(error);
                      }
                    }}
                    className="w-full bg-red-600 text-white flex items-center justify-center gap-3 p-5 text-[11px] font-black uppercase tracking-[0.3em] hover:bg-black transition-all"
                  >
                    <CreditCard size={18} />
                    Pay & Confirm Slot
                  </button>
                </div>
              )}

              {step === 5 && (
                <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                  <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 text-white">
                    <CheckCircle size={40} />
                  </div>
                  <h2 className="text-3xl font-black mb-2 uppercase tracking-tighter">Confirmed.</h2>
                  <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] font-bold leading-relaxed mb-10">
                    Booking locked for {bookingData.name}. <br /> Confirmation and receipt sent to <span className="text-black">{bookingData.email}</span>.
                  </p>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleRebook} className="bg-black text-white flex items-center justify-center gap-3 p-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-red-600 transition-all">
                      <RefreshCw size={14} /> Schedule Another Ritual
                    </button>
                    <button onClick={onClose} className="border border-gray-200 p-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-gray-50 transition-all">Close</button>
                  </div>
                </div>
              )}
            </div>

            {step < 4 && (
              <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                {step > 1 && (
                  <button onClick={() => setStep(step - 1)} className="flex-1 p-4 text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:bg-gray-50 transition-all">Back</button>
                )}
                <button
                  disabled={(step === 2 && (!bookingData.date || !bookingData.slot))}
                  onClick={handleNext}
                  className="flex-[2] bg-black text-white p-4 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-10"
                >
                  {step === 3 ? 'Review Ritual' : 'Continue'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [activeTest, setActiveTest] = useState(0);

  useEffect(() => {
    const int = setInterval(() => setActiveTest(v => (v + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(int);
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9F7] font-sans text-black selection:bg-red-600 selection:text-white overflow-x-hidden">
      <Navbar onBookNow={() => setIsBookingOpen(true)} />
      <BookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

      {/* HERO */}
      <section id="home" className="relative h-screen flex items-center px-6 md:px-12">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=2000"
            className="w-full h-full object-cover brightness-[0.3]"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-80"></div>
        </div>

        <div className="relative z-10 max-w-5xl mt-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-12 bg-red-600"></div>
            <span className="text-white text-[10px] font-black uppercase tracking-[0.5em]">The Grooming Standard</span>
          </div>
          <h1 className="text-white text-6xl md:text-[140px] font-black mb-10 tracking-tighter leading-[0.8] uppercase">
            Twin <br /><span className="text-red-600">Scissors</span>
          </h1>
          <p className="text-white/60 text-sm md:text-xl mb-12 max-w-xl font-medium uppercase tracking-[0.2em] leading-relaxed">
            Orugodawatta's most exclusive barber lounge. Experience the artistry of elite grooming.
          </p>
          <div className="flex flex-col md:flex-row gap-4">
            <button onClick={() => setIsBookingOpen(true)} className="bg-red-600 text-white px-12 py-5 font-black uppercase tracking-[0.25em] text-[11px] hover:bg-white hover:text-black transition-all duration-500">
              Secure My Slot
            </button>
            <button onClick={() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' })} className="border border-white/20 text-white px-12 py-5 font-black uppercase tracking-[0.25em] text-[11px] hover:bg-white hover:text-black transition-all duration-500 backdrop-blur-sm">
              Explore Rituals
            </button>
          </div>
        </div>
      </section>

      {/* PHILOSOPHY (Lite Background) */}
      <section id="about" className="py-40 px-6 md:px-12 bg-white">
        <div className="max-w-[1440px] mx-auto grid lg:grid-cols-12 gap-16 items-center">
          <div className="lg:col-span-7 relative group">
            <div className="absolute -inset-10 border border-gray-100 -z-10 translate-x-10 translate-y-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-1000"></div>
            <img
              src={`${import.meta.env.BASE_URL}images/about.jpg`}
              className="w-full grayscale hover:grayscale-0 transition-all duration-1000 shadow-2xl rounded-sm"
              alt="Art of Grooming"
            />
          </div>
          <div className="lg:col-span-5 lg:pl-12">
            <span className="text-red-600 font-black text-[12px] uppercase tracking-[0.5em] mb-8 block">Legacy of Excellence</span>
            <h2 className="text-6xl md:text-8xl font-black mb-10 tracking-tighter uppercase leading-[0.85]">Elite <br />Craft.</h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-12 font-medium tracking-wide">
              Twin Scissors is Orugodawatta's premier grooming destination. We believe a haircut isn't just a service—it's a ritual of confidence. Every edge is sharp and every experience is luxury.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES (Merged with Dark Aesthetic Portfolio) */}
      <section id="services" className="py-40 bg-[#111] text-white overflow-hidden">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-xl">
              <span className="text-red-600 font-black text-[12px] uppercase tracking-[0.5em] mb-4 block">The Ritual Menu</span>
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">Selected <br />Services.</h2>
            </div>
            <button onClick={() => setIsBookingOpen(true)} className="text-[11px] text-white/40 font-black uppercase tracking-[0.3em] border-b border-white/10 pb-2 hover:text-red-600 hover:border-red-600 transition-all">Start Your Booking</button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
            {SERVICES.map((s, i) => (
              <div key={s.id} className="relative aspect-[3/4] overflow-hidden group">
                <img src={s.img} className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-[1500ms]" alt={s.name} />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                  <span className="text-red-600 text-[10px] font-black tracking-[0.3em] uppercase mb-2">{s.category}</span>
                  <h4 className="text-2xl font-black uppercase tracking-tight mb-4">{s.name}</h4>
                  <div className="flex justify-between items-end border-t border-white/20 pt-4">
                    <p className="text-lg font-black tracking-tighter">LKR {s.price.toLocaleString()}</p>
                    <button onClick={() => setIsBookingOpen(true)} className="text-[10px] font-black uppercase tracking-widest border border-white px-4 py-2 hover:bg-white hover:text-black transition-all">Reserve</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-40 bg-gray-50 overflow-hidden relative">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 text-center">
          <div className="relative min-h-[350px] flex items-center justify-center">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`transition-all duration-1000 absolute w-full inset-0 flex flex-col items-center justify-center ${i === activeTest ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95 pointer-events-none'}`}
              >
                <p className="text-2xl md:text-5xl font-black italic leading-[1.2] mb-12 tracking-tight max-w-5xl uppercase">"{t.text}"</p>
                <h4 className="font-black text-sm uppercase tracking-[0.5em] mb-1">{t.name}</h4>
                <span className="text-[10px] text-red-600 font-bold uppercase tracking-widest">{t.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-[#111111] text-white pt-32 pb-12 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-24 mb-24 items-start">
            <div className="space-y-8">
              <div className="flex flex-col">
                <span className="font-black text-4xl tracking-tighter leading-none">TWIN SCISSORS</span>
                <span className="text-red-600 text-[11px] tracking-[0.6em] font-light mt-1 uppercase">Grooming & Lounge</span>
              </div>
              <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xs">
                Refining modern masculinity through the art of precision grooming in Orugodawatta.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/40"><Facebook size={18} /></a>
                <a href="#" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/40"><Instagram size={18} /></a>
                <a href="#" className="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all text-white/40"><Smartphone size={18} /></a>
              </div>
            </div>

            <div>
              <h5 className="text-white text-[12px] font-black uppercase tracking-[0.5em] mb-10 border-l-2 border-red-600 pl-4">Inquiries</h5>
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <Phone size={22} className="text-red-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-black text-white/30 mb-2 tracking-widest">Phone Line</p>
                    <p className="text-xs font-bold whitespace-nowrap uppercase tracking-widest">{PHONE_NUMBER}</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <Mail size={22} className="text-red-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-black text-white/30 mb-2 tracking-widest">Support Email</p>
                    <p className="text-xs font-bold uppercase tracking-widest">{SUPPORT_EMAIL}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 className="text-white text-[12px] font-black uppercase tracking-[0.5em] mb-10 border-l-2 border-red-600 pl-4">Visit Lounge</h5>
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <MapPin size={22} className="text-red-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-black text-white/30 mb-2 tracking-widest">Address</p>
                    <p className="text-xs font-bold leading-relaxed">{ADDRESS}</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <Clock size={22} className="text-red-600 shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase font-black text-white/30 mb-2 tracking-widest">Opening Hours</p>
                    <p className="text-xs font-bold uppercase tracking-widest">Tue - Sun <br /> 09:00 AM - 07:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 p-8 border border-white/10 rounded-2xl flex flex-col justify-between">
              <div>
                <h5 className="text-white text-[12px] font-black uppercase tracking-[0.5em] mb-4">Priority Action</h5>
                <p className="text-[9px] text-white/40 uppercase mb-8 leading-relaxed">Secure your preferred ritual time instantly via PayHere secure checkout.</p>
              </div>
              <button onClick={() => setIsBookingOpen(true)} className="w-full bg-red-600 text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all rounded-sm">
                Book Ritual Now
              </button>
            </div>
          </div>

          <div className="border-t border-white/10 pt-16 flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-black">© 2026 TWIN SCISSORS GROOMING CO. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-3 group cursor-pointer">
              <span className="text-[10px] text-white/10 uppercase tracking-widest font-bold">Experience by</span>
              <span className="text-[11px] text-white font-black uppercase tracking-[0.4em] border-b-2 border-red-600/30 group-hover:text-red-600 transition-all">Pixel Crew</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
