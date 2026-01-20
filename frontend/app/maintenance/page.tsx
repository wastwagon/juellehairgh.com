import Image from "next/image";
import Link from "next/link";
import { Instagram, MessageCircle, Sparkles } from "lucide-react";

export const metadata = {
  title: "Elevating Your Experience | Le Juelle Hair",
  description: "We are currently refining our digital boutique to bring you something extraordinary.",
};

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative background elements for a luxury feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-100/30 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/30 rounded-full blur-[120px]" />

      <div className="max-w-3xl w-full space-y-12 relative z-10 text-center">
        {/* Logo Section */}
        <div className="flex justify-center transition-transform duration-700 hover:scale-105">
          <Image
            src="/logo.png"
            alt="Le Juelle Hair"
            width={220}
            height={80}
            priority
            className="h-auto"
          />
        </div>

        {/* Hero Content */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 text-pink-600 text-[10px] font-bold uppercase tracking-[0.2em] mx-auto">
            <Sparkles className="h-3 w-3" />
            Boutique Enhancement
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
            Elevating Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-500">
              Juelle Experience
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed font-light">
            We are currently refining our digital boutique to bring you our most exquisite collection yet. Our team is working behind the scenes to enhance every detail of your shopping journey.
          </p>
        </div>

        {/* Call to Action / Socials */}
        <div className="pt-12 border-t border-gray-200/60 max-w-md mx-auto">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-[0.15em] mb-8">
            Stay connected for the grand unveiling
          </p>
          
          <div className="flex justify-center items-center gap-8">
            <a
              href="https://instagram.com/juellehairgh"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 transition-all"
            >
              <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 group-hover:shadow-md group-hover:border-pink-200 transition-all">
                <Instagram size={28} className="text-gray-700 group-hover:text-pink-600 transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 group-hover:text-pink-600 uppercase tracking-widest">Instagram</span>
            </a>
            
            <a
              href="https://wa.me/233539506949"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center gap-3 transition-all"
            >
              <div className="p-4 rounded-2xl bg-white shadow-sm border border-gray-100 group-hover:shadow-md group-hover:border-green-200 transition-all">
                <MessageCircle size={28} className="text-gray-700 group-hover:text-green-500 transition-colors" />
              </div>
              <span className="text-[10px] font-bold text-gray-500 group-hover:text-green-500 uppercase tracking-widest">WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-16">
          <p className="text-sm text-gray-400 italic">
            Quality takes time. We appreciate your patience.
          </p>
        </div>
      </div>
    </div>
  );
}
