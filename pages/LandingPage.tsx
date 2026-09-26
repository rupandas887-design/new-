import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import GenderChart from '../components/charts/GenderChart';
import OccupationChart from '../components/charts/OccupationChart';
import SupportChart from '../components/charts/SupportChart';
import Leaderboard from '../components/Leaderboard';
import Rewards from '../components/Rewards';
import OrgMarquee from '../components/ui/OrgMarquee';
import VolunteerMarquee from '../components/ui/VolunteerMarquee';
import { supabase } from '../supabase/client';
import { Member, Organisation, Role } from '../types';
import { 
  Users, 
  Activity, 
  Building2, 
  Compass, 
  Layers, 
  Target, 
  UserPlus, 
  Share2, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  HeartHandshake,
  Sparkles,
  Phone,
  Radio
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [orgsDataRaw, setOrgsDataRaw] = useState<Organisation[]>([]);
  const [volsDataRaw, setVolsDataRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, oRes, pRes] = await Promise.all([
        supabase.from('members').select('*'),
        supabase.from('organisations').select('*'),
        supabase.from('profiles').select('*, organisations(name)')
      ]);

      if (mRes.error) console.error("LandingPage members query failed:", mRes.error);
      if (oRes.error) console.error("LandingPage organisations query failed:", oRes.error);
      if (pRes.error) console.error("LandingPage profiles query failed:", pRes.error);

      if (mRes.data) setMembers(mRes.data as Member[]);
      if (oRes.data) setOrgsDataRaw(oRes.data as Organisation[]);
      if (pRes.data) {
        setVolsDataRaw((pRes.data as any[]).filter(p => String(p.role || '').toLowerCase() === 'volunteer'));
      }
    } catch (err) {
      console.error("LandingPage Sync Failure:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Process and de-duplicate lists
  const { organisations, volunteers } = useMemo(() => {
    const seenOrgIdentities = new Set<string>();

    const uniqueOrgs: Organisation[] = [];
    (orgsDataRaw || []).forEach(o => {
      const nameKey = (o.name || '').toLowerCase().trim();
      const secretaryKey = (o.secretary_name || '').toLowerCase().trim();
      const mobileKey = (o.mobile || '').trim();
      
      const footprint = `${secretaryKey}-${mobileKey}`;
      if (seenOrgIdentities.has(footprint)) return;
      
      uniqueOrgs.push(o);
      seenOrgIdentities.add(footprint);
      seenOrgIdentities.add(`${nameKey}-${mobileKey}`);
    });

    const enrollmentMap = members.reduce((acc, m) => {
      if (m.volunteer_id) acc[m.volunteer_id] = (acc[m.volunteer_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const uniqueVols: any[] = [];
    const volDedupeSet = new Set<string>();

    (volsDataRaw || []).forEach(v => {
      const nameKey = (v.name || '').toLowerCase().trim();
      const mobileKey = (v.mobile || '').trim();
      const footprint = `${nameKey}-${mobileKey}`;

      if (volDedupeSet.has(footprint)) return;

      uniqueVols.push({
        id: v.id,
        name: v.name || 'Anonymous',
        email: v.email,
        role: Role.Volunteer,
        organisationId: v.organisation_id,
        organisationName: v.organisations?.name || 'Independent',
        mobile: v.mobile,
        enrollments: enrollmentMap[v.id] || 0,
        profile_photo_url: v.profile_photo_url, 
      });

      volDedupeSet.add(footprint);
    });

    return { 
      organisations: uniqueOrgs.reverse(),
      volunteers: uniqueVols.reverse() 
    };
  }, [orgsDataRaw, volsDataRaw, members]);

  return (
    <div className="bg-[#F5F7FB] text-slate-900 min-h-screen selection:bg-saffron-500/20 overflow-x-hidden font-sans relative">
      {/* Extremely subtle ambient lighting across canvas */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none">
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-saffron-500/[0.03] rounded-full blur-3xl"></div>
        <div className="absolute top-24 right-1/4 w-96 h-96 bg-saffron-400/[0.03] rounded-full blur-3xl"></div>
      </div>

      <Header isLandingPage />

      {/* Hero Section */}
      <section className="pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-[1200px] mx-auto text-center">
          
          {/* Main Community Intelligence Surface */}
          <div className="max-w-4xl mx-auto bg-transparent border-none shadow-none p-6 sm:p-10 md:p-12 mb-12 sm:mb-16 text-left relative overflow-hidden">
            {/* Subtle Saffron Glow in top right */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-saffron-500/[0.05] via-saffron-400/[0.03] to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

            {/* Header & Subtitle */}
            <div className="pb-6 sm:pb-8 mb-6 sm:mb-8 relative z-10 flex flex-col items-center text-center mx-auto max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-saffron-50 border border-saffron-200/60 mb-4 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-saffron-500 animate-pulse"></span>
                <Activity size={13} className="text-saffron-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-saffron-700">
                  SSK Samaj Intelligence
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight text-center">
                A Live Community Dashboard for a Stronger SSK Samaj
              </h1>

              <div className="flex items-center justify-center mt-4 bg-transparent border-none shadow-none text-center">
                <p className="text-xs sm:text-sm md:text-base text-saffron-950 font-semibold tracking-tight text-center">
                  Know Our People. Understand Their Needs. Build Better Support.
                </p>
              </div>
            </div>

            {/* Narrative Feature Blocks */}
            <div className="space-y-3.5 sm:space-y-4 relative z-10">
              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3.5 sm:gap-4 hover:border-saffron-200 transition-colors">
                <div className="p-2.5 rounded-xl bg-saffron-50 border border-saffron-100 text-saffron-600 shrink-0 mt-0.5">
                  <Activity size={18} />
                </div>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                  <strong className="text-slate-900 font-semibold">SSK PEOPLE</strong> is a community-driven Live Registry &amp; Intelligence Dashboard created to help the SSK Samaj understand its people beyond numbers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3.5 sm:gap-4 hover:border-saffron-200 transition-colors">
                <div className="p-2.5 rounded-xl bg-saffron-100 border border-saffron-200 text-saffron-700 shrink-0 mt-0.5">
                  <UserCheck size={18} />
                </div>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                  As registrations are verified and continuously added by Samaj organisations and dedicated volunteers, this platform brings together real community data to reveal who our people are, what they need, and where support is required.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start gap-3.5 sm:gap-4 hover:border-emerald-200 transition-colors">
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0 mt-0.5">
                  <Layers size={18} />
                </div>
                <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal">
                  From Education, Jobs and Business to Health, Marriage, Housing and Government Assistance, SSK PEOPLE is designed to transform individual needs into a clear community-level view—helping Samaj organisations and volunteers plan, connect and act more effectively.
                </p>
              </div>
            </div>

            {/* Manifesto Callout & Three Pillars */}
            <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-[#0B1020] via-[#0E1528] to-[#111827] text-white shadow-xl relative z-10 overflow-hidden">
              {/* Subtle ambient light inside dark card */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-gradient-to-br from-saffron-500/20 to-saffron-400/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex items-center gap-2 mb-2 relative z-10">
                <Sparkles size={16} className="text-saffron-400" />
                <p className="text-xs sm:text-sm font-bold tracking-wider text-saffron-300 uppercase">
                  THIS IS MORE THAN A REGISTRY.
                </p>
              </div>
              <p className="text-white text-base sm:text-xl font-bold relative z-10">
                It is a live, transparent picture of our community.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-6 relative z-10">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-saffron-500/20 text-saffron-300 border border-saffron-500/30">
                      <UserCheck size={14} />
                    </div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-saffron-200">
                      Collective Depth
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-normal leading-snug">
                    Every verified member adds to the collective understanding of our Samaj.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-saffron-500/20 text-saffron-300 border border-saffron-500/30">
                      <Target size={14} />
                    </div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-saffron-200">
                      Actionable Need
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-normal leading-snug">
                    Every identified need creates an opportunity to support.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <Building2 size={14} />
                    </div>
                    <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-200">
                      United Network
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-normal leading-snug">
                    Every volunteer and organisation becomes part of the solution.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Creed & Closing */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs sm:text-sm font-semibold">
                  <UserPlus size={14} className="text-saffron-600" />
                  <span>Register</span>
                </div>
                <ArrowRight size={12} className="text-slate-400 hidden sm:block" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs sm:text-sm font-semibold">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Verify</span>
                </div>
                <ArrowRight size={12} className="text-slate-400 hidden sm:block" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs sm:text-sm font-semibold">
                  <Compass size={14} className="text-saffron-600" />
                  <span>Understand</span>
                </div>
                <ArrowRight size={12} className="text-slate-400 hidden sm:block" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-700 text-xs sm:text-sm font-semibold">
                  <Share2 size={14} className="text-saffron-600" />
                  <span>Connect</span>
                </div>
                <ArrowRight size={12} className="text-slate-400 hidden sm:block" />

                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#FF8A00] to-[#E87500] text-black text-xs sm:text-sm font-bold shadow-sm">
                  <HeartHandshake size={14} />
                  <span>Support</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 max-w-lg mx-auto pt-1 text-center">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <p className="text-xs sm:text-sm text-slate-500 font-normal leading-relaxed">
                  Together, we can build a more connected, transparent and responsive SSK community.
                </p>
              </div>
            </div>
          </div>

          {/* Deity / Heritage Reference */}
          <div className="flex justify-center mt-4 sm:mt-6">
            <div className="max-w-[240px] sm:max-w-xs w-full px-2 sm:px-4 bg-transparent border-0 shadow-none">
              <img 
                src="https://i.pinimg.com/736x/68/ac/f6/68acf6f32a216959c497c7a232b35551.jpg" 
                alt="Sahasrarjuna Illustration" 
                className="w-full h-auto max-h-[260px] sm:max-h-[300px] object-contain mx-auto bg-transparent border-0 shadow-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Registry Marquees - The "Announcement Slider" */}
      <section className="border-t border-slate-200/80 pt-10 sm:pt-14">
        <div className="container mx-auto px-4 md:px-6 mb-6">
           <div className="flex flex-col items-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-saffron-600 mb-1">Affiliated Network</span>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">In Association With</h2>
           </div>
        </div>
        
        <OrgMarquee organisations={organisations} />
      </section>

      {/* Analytics Section */}
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-20 border-t border-slate-200/80">
        <section id="analytics" className="space-y-8 md:space-y-10">
          <div className="text-center mb-10 md:mb-14">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200/60 text-saffron-700 text-xs font-semibold mb-2">
              <Radio size={12} className="text-saffron-600 animate-pulse" />
              Live Telemetry
            </span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Community Live Analytics
            </h2>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-2">
              Real-Time Uplink: {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 md:gap-8">
            {/* Stat 1: Total Members */}
            <div className="md:col-span-4 analytics-card p-6 sm:p-8 md:p-10 flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Verified Members
                </span>
                <div className="w-10 h-10 rounded-xl bg-saffron-50 border border-saffron-100 flex items-center justify-center text-saffron-600">
                  <Users size={20} />
                </div>
              </div>
              
              <div className="my-auto py-2">
                <p className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                  {members.length}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Verified Samaj Families</span>
                <span className="font-semibold text-emerald-600">Active Node</span>
              </div>
            </div>

            {/* Stat 2: Gender Distribution */}
            <div className="md:col-span-4 analytics-card p-6 sm:p-8 min-h-[300px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="chart-title">Gender Distribution</h3>
                <span className="text-[11px] font-semibold text-slate-400">Demographic</span>
              </div>
              <GenderChart members={members} />
            </div>

            {/* Stat 3: Professional Demographics */}
            <div className="md:col-span-4 analytics-card p-6 sm:p-8 min-h-[300px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <h3 className="chart-title">Professional Profile</h3>
                <span className="text-[11px] font-semibold text-slate-400">Careers</span>
              </div>
              <OccupationChart members={members} />
            </div>

            {/* Stat 4: Support Needs */}
            <div className="md:col-span-8 analytics-card p-6 sm:p-8 md:p-10 min-h-[340px] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="chart-title">Community Support Needs</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Identified areas where community intervention and assistance are requested</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-saffron-50 text-saffron-700 border border-saffron-100">
                  Actionable
                </span>
              </div>
              <SupportChart members={members} />
            </div>

            {/* Stat 5: Network Activity */}
            <div className="md:col-span-4 analytics-card p-6 sm:p-8 flex flex-col justify-between min-h-[340px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="chart-title">Network Activity</h3>
                <span className="text-[11px] font-semibold text-slate-400">Deployments</span>
              </div>
              
              <div className="flex-1 flex flex-col items-center justify-center space-y-6 py-4">
                <div className="flex flex-col items-center text-center">
                  <div className="activity-icon-container mb-3">
                    <UserCheck size={28} className="text-saffron-600 animate-pulse-soft" />
                  </div>
                  <p className="text-4xl sm:text-5xl font-extrabold text-slate-900 tabular-nums">{volunteers.length}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Field Volunteers</p>
                </div>
                
                <div className="w-full h-px bg-slate-100"></div>

                <div className="flex flex-col items-center text-center">
                  <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">{organisations.length}</p>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Samaj Organisations</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hall of Fame */}
        <section className="mt-14 sm:mt-20">
           <Rewards members={members} volunteers={volunteers} organisations={organisations} />
        </section>

        {/* Leaderboard */}
        <section className="mt-14 sm:mt-20">
           <Leaderboard members={members} organisations={organisations} volunteers={volunteers} />
        </section>

        {/* Join Registry CTA */}
        <section className="text-center pt-14 sm:pt-20 pb-8 px-2 sm:px-4">
          <div className="max-w-4xl mx-auto py-10 sm:py-14 px-6 sm:px-12 bg-gradient-to-br from-[#0B1020] via-[#0E1528] to-[#111827] text-white border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden group">
            {/* Subtle glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-saffron-500/20 to-saffron-400/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-saffron-300 border border-white/10 text-xs font-semibold mb-3">
                <Sparkles size={13} className="text-saffron-400" />
                Community Direct Channel
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
                Join the SSK Registry
              </h2>
              <p className="text-slate-300 font-normal text-xs sm:text-sm md:text-base mb-8 max-w-lg mx-auto">
                Become a verified contributor or register your family with the global SSK community database.
              </p>
              <div className="flex justify-center">
                <a 
                  href="tel:+918884449689" 
                  className="inline-flex items-center justify-center gap-3 px-8 sm:px-12 py-4 bg-gradient-to-r from-[#FF8A00] to-[#E87500] hover:from-[#E87500] hover:to-[#C65E00] rounded-2xl text-base sm:text-lg font-bold tracking-tight text-black transition-all shadow-[0_10px_30px_rgba(255,138,0,0.35)] active:scale-[0.98]"
                >
                  <Phone size={20} />
                  <span>Call Helpline: +91 888 444 9689</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Volunteer Announcement Bar */}
        <section className="pb-12 md:pb-16">
          <div className="container mx-auto px-4 md:px-6 mb-4 mt-6">
             <div className="flex flex-col items-center text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-saffron-600 mb-1">Our Dedicated Personnel</span>
                <h2 className="text-lg md:text-2xl font-extrabold text-slate-900 tracking-tight">Active Field Volunteers</h2>
             </div>
          </div>
          <VolunteerMarquee volunteers={volunteers} />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
