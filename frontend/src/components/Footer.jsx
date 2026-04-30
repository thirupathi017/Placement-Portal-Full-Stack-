import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-primary-600 p-2 rounded-lg text-white">
                <ShieldCheck size={24} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
                Placement<span className="text-primary-600">Portal</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed">
              Empowering students and connecting them with top-tier companies. Streamlining the recruitment process for a better future.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-slate-400 hover:text-primary-600 transition-colors">
                <Github size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-slate-800 dark:text-white font-bold tracking-wide uppercase text-sm">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-slate-500 hover:text-primary-600 text-sm transition-colors">Student Dashboard</Link>
              </li>
              <li>
                <Link to="/jobs" className="text-slate-500 hover:text-primary-600 text-sm transition-colors">Browse Jobs</Link>
              </li>
              <li>
                <Link to="/company/dashboard" className="text-slate-500 hover:text-primary-600 text-sm transition-colors">Employer Portal</Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-500 hover:text-primary-600 text-sm transition-colors">Login / Register</Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-slate-800 dark:text-white font-bold tracking-wide uppercase text-sm">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-slate-500 hover:text-primary-600 text-sm transition-colors">Interview Preparation</a>
              </li>
              <li>
                <a href="#" className="text-slate-500 hover:text-primary-600 text-sm transition-colors">Resume Guidelines</a>
              </li>
              <li>
                <a href="#" className="text-slate-500 hover:text-primary-600 text-sm transition-colors">Placement Policy</a>
              </li>
              <li>
                <a href="#" className="text-slate-500 hover:text-primary-600 text-sm transition-colors">FAQs</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-slate-800 dark:text-white font-bold tracking-wide uppercase text-sm">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-slate-500 text-sm">
                <MapPin size={18} className="text-primary-600 flex-shrink-0 mt-0.5" />
                <span>123 University Campus Drive, Academic Block, Tech City 10001</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-500 text-sm">
                <Phone size={18} className="text-primary-600 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-500 text-sm">
                <Mail size={18} className="text-primary-600 flex-shrink-0" />
                <span>placements@university.edu</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm text-center md:text-left">
            © {new Date().getFullYear()} PlacementPortal. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 text-sm text-slate-500">
            <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
