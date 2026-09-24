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
  Globe, 
  HeartPulse, 
  ShieldCheck, 
  UserCheck, 
  HeartHandshake, 
  Sparkles, 
  Activity, 
  Building2, 
  Compass, 
  Layers, 
  Target, 
  UserPlus, 
  Share2, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [orgsDataRaw, setOrgsDataRaw] = useState<Organisation[]>([]);
  const [volsDataRaw, setVolsDataRaw] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [mRes, oRes, pRes] = await Promise.all([
        supabase.from('members').select('*'),
        supabase.from('organisations').select('*'),
        supabase.from('profiles').select('*, organisations(name)')
      ]);
      if (mRes.data) setMembers(mRes.data);
      if (oRes.data) setOrgsDataRaw(oRes.data);
      if (pRes.data) {
        setVolsDataRaw(pRes.data.filter(p => String(p.role).toLowerCase() === 'volunteer'));
      }
    } catch (err) {
      console.error("Sync Failure:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [fetchData]);

  // Process and de-duplicate both lists with cross-role exclusivity
  const { organisations, volunteers } = useMemo(() => {
    const seenIdentities = new Set<string>();

    // 1. Process Organisations (Primary Priority)
    const uniqueOrgs: Organisation[] = [];
    (orgsDataRaw || []).forEach(o => {
      const nameKey = (o.name || '').toLowerCase().trim();
      const secretaryKey = (o.secretary_name || '').toLowerCase().trim();
      const mobileKey = (o.mobile || '').trim();
      
      // Create identity footprint (combining org name, lead name and mobile)
      const footprint = `${secretaryKey}-${mobileKey}`;
      
      // De-duplicate within Orgs list itself
      if (seenIdentities.has(footprint)) return;
      
      uniqueOrgs.push(o);
      seenIdentities.add(footprint);
      // Also track the business name to be extra safe
      seenIdentities.add(`${nameKey}-${mobileKey}`);
    });

    // 2. Prepare Volunteer Enrollment Map
    const enrollmentMap = members.reduce((acc, m) => {
      if (m.volunteer_id) acc[m.volunteer_id] = (acc[m.volunteer_id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // 3. Process Volunteers (Exclude if already represented in Organizations)
    const uniqueVols: any[] = [];
    const volDedupeSet = new Set<string>();

    (volsDataRaw || []).forEach(v => {
      const nameKey = (v.name || '').toLowerCase().trim();
      const mobileKey = (v.mobile || '').trim();
      const footprint = `${nameKey}-${mobileKey}`;

      // CROSS-SECTION DEDUPLICATION:
      // If this person is already an Org lead or the Org identity, skip them here.
      if (seenIdentities.has(footprint)) return;
      
      // SELF-DEDUPLICATION:
      // Prevent the same volunteer from appearing twice in the volunteer list
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
      organisations: uniqueOrgs.reverse(), // Newest first
      volunteers: uniqueVols.reverse() 
    };
  }, [orgsDataRaw, volsDataRaw, members]);

  return (
    <div className="bg-black text-white min-h-screen selection:bg-[#FF6600]/30 overflow-x-hidden font-jost">
      <Header isLandingPage />

      {/* Hero Section */}
      <section className="pt-6 sm:pt-10 md:pt-14 pb-8 sm:pb-12 md:pb-18 px-3 sm:px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          {/* Community Intelligence Section */}
          <div className="max-w-4xl mx-auto rounded-2xl sm:rounded-3xl border border-white/10 bg-[#070707] shadow-2xl p-4 sm:p-8 md:p-12 mb-10 sm:mb-14 md:mb-16 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF6600]/5 blur-3xl rounded-full pointer-events-none -mr-20 -mt-20"></div>

            {/* Header & Subtitle */}
            <div className="border-b border-white/5 pb-5 sm:pb-8 mb-6 sm:mb-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 mb-3.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#FF6600] animate-pulse"></span>
                <Activity size={12} className="text-[#FF6600]" />
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#FF6600]">
                  SSK PEOPLE
                </span>
              </div>
              
              <h2 className="font-cinzel text-base sm:text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-wide text-white leading-snug break-words">
                A LIVE COMMUNITY DASHBOARD FOR A STRONGER SSK SAMAJ
              </h2>

              <div className="flex items-start sm:items-center gap-2.5 mt-3 sm:mt-4 p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <Target size={16} className="text-[#FF6600] shrink-0 mt-0.5 sm:mt-0" />
                <p className="text-xs sm:text-sm md:text-base text-orange-200/90 font-medium tracking-wide">
                  Know Our People. Understand Their Needs. Build Better Support.
                </p>
              </div>
            </div>

            {/* Narrative Feature Blocks */}
            <div className="space-y-3.5 sm:space-y-4 relative z-10">
              <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.015] border border-white/5 flex items-start gap-3 sm:gap-4 hover:border-orange-500/20 transition-all">
                <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/15 text-[#FF6600] shrink-0 mt-0.5">
                  <Activity size={16} />
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                  SSK PEOPLE is a community-driven Live Registry &amp; Intelligence Dashboard created to help the SSK Samaj understand its people beyond numbers.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.015] border border-white/5 flex items-start gap-3 sm:gap-4 hover:border-orange-500/20 transition-all">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/15 text-blue-400 shrink-0 mt-0.5">
                  <UserCheck size={16} />
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                  As registrations are verified and continuously added by Samaj organisations and dedicated volunteers, this platform brings together real community data to reveal who our people are, what they need, and where support is required.
                </p>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.015] border border-white/5 flex items-start gap-3 sm:gap-4 hover:border-orange-500/20 transition-all">
                <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/15 text-green-400 shrink-0 mt-0.5">
                  <Layers size={16} />
                </div>
                <p className="text-xs sm:text-sm md:text-base text-gray-300 leading-relaxed">
                  From Education, Jobs and Business to Health, Marriage, Housing and Government Assistance, SSK PEOPLE is designed to transform individual needs into a clear community-level view—helping Samaj organisations and volunteers plan, connect and act more effectively.
                </p>
              </div>
            </div>

            {/* Manifesto Callout & Three Pillars */}
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#FF6600]" />
                <p className="font-cinzel font-bold text-xs sm:text-sm md:text-base tracking-[0.2em] text-[#FF6600] uppercase">
                  THIS IS MORE THAN A REGISTRY.
                </p>
              </div>
              <p className="text-white text-sm sm:text-base md:text-lg font-medium pl-6">
                It is a LIVE picture of our community.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-5">
                <div className="p-3.5 sm:p-4 rounded-xl bg-black/70 border border-white/5 flex flex-col justify-between gap-3 group hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      <UserCheck size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-orange-400/80">
                      Collective Depth
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 font-normal leading-snug">
                    Every verified member adds to the collective understanding of our Samaj.
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-black/70 border border-white/5 flex flex-col justify-between gap-3 group hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      <Target size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-blue-400/80">
                      Actionable Need
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 font-normal leading-snug">
                    Every identified need creates an opportunity to support.
                  </p>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl bg-black/70 border border-white/5 flex flex-col justify-between gap-3 group hover:border-green-500/30 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20">
                      <Building2 size={14} />
                    </div>
                    <span className="text-[10px] uppercase font-black tracking-widest text-green-400/80">
                      United Network
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-300 font-normal leading-snug">
                    Every volunteer and organisation becomes part of the solution.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Creed & Closing */}
            <div className="mt-6 sm:mt-8 pt-5 sm:pt-7 border-t border-white/5 flex flex-col items-center text-center space-y-4 relative z-10">
              {/* Responsive Stepper Chain */}
              <div className="w-full flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs sm:text-sm font-semibold hover:border-orange-500/40 transition-colors">
                  <UserPlus size={14} className="text-[#FF6600]" />
                  <span>Register</span>
                </div>
                <ArrowRight size={12} className="text-gray-600 hidden sm:block" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs sm:text-sm font-semibold hover:border-orange-500/40 transition-colors">
                  <ShieldCheck size={14} className="text-green-400" />
                  <span>Verify</span>
                </div>
                <ArrowRight size={12} className="text-gray-600 hidden sm:block" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs sm:text-sm font-semibold hover:border-orange-500/40 transition-colors">
                  <Compass size={14} className="text-blue-400" />
                  <span>Understand</span>
                </div>
                <ArrowRight size={12} className="text-gray-600 hidden sm:block" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-white text-xs sm:text-sm font-semibold hover:border-orange-500/40 transition-colors">
                  <Share2 size={14} className="text-purple-400" />
                  <span>Connect</span>
                </div>
                <ArrowRight size={12} className="text-gray-600 hidden sm:block" />

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/25 text-[#FF6600] text-xs sm:text-sm font-bold shadow-sm">
                  <HeartHandshake size={14} />
                  <span>Support</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 max-w-lg mx-auto pt-1">
                <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                <p className="text-xs sm:text-sm md:text-base text-gray-400 font-normal leading-relaxed">
                  Together, we can build a more connected, transparent and responsive SSK community.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-4 sm:mt-6 md:mt-8">
            <div className="max-w-[260px] sm:max-w-xs md:max-w-sm w-full px-2 sm:px-4">
              <img 
                src="https://i.pinimg.com/736x/68/ac/f6/68acf6f32a216959c497c7a232b35551.jpg" 
                alt="Sahasrarjuna Illustration" 
                className="w-full h-auto max-h-[280px] sm:max-h-[340px] md:max-h-[380px] object-contain mx-auto rounded-2xl border border-white/10 shadow-2xl shadow-black/70"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Modern Registry Marquees - The "Announcement Slider" */}
      <section className="mt-12 md:mt-24 border-t border-white/5 pt-12">
        <div className="container mx-auto px-4 md:px-6 mb-8">
           <div className="flex flex-col items-center">
              <h2 className="text-xl md:text-3xl font-cinzel uppercase tracking-[0.2em] text-white">In Association With</h2>
           </div>
        </div>
        
        <OrgMarquee organisations={organisations} />
      </section>

      {/* Analytics Section */}
      <main className="container mx-auto px-4 md:px-6 py-16 md:py-24 border-t border-white/5">
        <section id="analytics" className="space-y-8 md:space-y-10">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-2xl md:text-5xl font-cinzel text-center uppercase tracking-widest text-[#FF6600] flex items-center justify-center gap-3 md:gap-4">
              <span className="text-[#FF6600]">•</span> LIVE ANALYTICS
            </h2>
            <p className="text-[10px] md:text-[11px] font-black text-white uppercase tracking-[0.4em] mt-4 md:mt-6 font-mono opacity-80">
              REAL-TIME UPLINK: {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' }).toUpperCase()}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 md:gap-8">
            <div className="md:col-span-4 analytics-card p-5 sm:p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[360px] md:min-h-[420px]">
              <Globe className="globe-watermark" size={140} />
              <div className="mb-4 sm:mb-6 md:mb-10 text-gray-700">
                <Users size={42} strokeWidth={1} />
              </div>
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white mb-4 sm:mb-6 md:mb-8 text-center">TOTAL VERIFIED MEMBERS</p>
              <p className="text-7xl sm:text-8xl md:text-9xl font-normal text-[#FF6600] font-cinzel leading-none">
                {members.length}
              </p>
            </div>

            <div className="md:col-span-4 analytics-card p-5 sm:p-8 md:p-12 min-h-[300px] sm:min-h-[360px] md:min-h-[420px]">
              <h3 className="chart-title mb-6 sm:mb-8 md:mb-12 text-center md:text-left">GENDER DISTRIBUTION</h3>
              <GenderChart members={members} />
            </div>

            <div className="md:col-span-4 analytics-card p-5 sm:p-8 md:p-12 min-h-[300px] sm:min-h-[360px] md:min-h-[420px]">
              <h3 className="chart-title mb-6 sm:mb-8 md:mb-12 text-center md:text-left">PROFESSIONAL DEMOGRAPHICS</h3>
              <OccupationChart members={members} />
            </div>

            <div className="md:col-span-8 analytics-card p-5 sm:p-8 md:p-12 min-h-[340px] sm:min-h-[400px] md:min-h-[480px]">
              <h3 className="chart-title mb-6 sm:mb-8 md:mb-12 text-center md:text-left">PEOPLE VOICE</h3>
              <SupportChart members={members} />
            </div>

            <div className="md:col-span-4 analytics-card p-5 sm:p-8 md:p-12 flex flex-col min-h-[340px] sm:min-h-[400px] md:min-h-[480px]">
              <h3 className="chart-title mb-6 sm:mb-10 md:mb-14 text-center">NETWORK ACTIVITY</h3>
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 sm:space-y-10 md:space-y-12">
                <div className="flex flex-col items-center">
                  <div className="activity-icon-container mb-4 sm:mb-6 md:mb-8">
                    <HeartPulse size={36} className="text-[#FF6600] animate-pulse-soft" />
                  </div>
                  <p className="text-4xl sm:text-5xl md:text-6xl font-black text-[#FF6600] font-cinzel leading-none">{volunteers.length}</p>
                  <p className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.4em] mt-2 md:mt-3">VOLUNTEERS</p>
                </div>
                <div className="w-1/2 h-px bg-white/5"></div>
                <div className="flex flex-col items-center">
                  <p className="text-4xl sm:text-5xl md:text-6xl font-black text-[#FF6600] font-cinzel leading-none">{organisations.length}</p>
                  <p className="text-[9px] md:text-[10px] font-black text-white uppercase tracking-[0.4em] mt-2 md:mt-3">ORGANIZATIONS</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Hall of Fame */}
        <section className="mt-14 sm:mt-24 md:mt-40">
           <Rewards members={members} volunteers={volunteers} organisations={organisations} />
        </section>

        <section className="mt-14 sm:mt-24 md:mt-40">
           <Leaderboard members={members} organisations={organisations} volunteers={volunteers} />
        </section>

        {/* Join Registry CTA */}
        <section className="text-center pt-14 sm:pt-24 md:pt-32 pb-8 md:pb-12 px-2 md:px-4">
          <div className="max-w-4xl mx-auto py-8 sm:py-10 md:py-12 px-4 sm:px-6 md:px-12 bg-[#000000] border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-cinzel text-white uppercase tracking-[0.2em] mb-4 sm:mb-6">
                JOIN THE REGISTRY
              </h2>
              <p className="text-white/70 font-normal text-xs sm:text-sm md:text-lg mb-8 sm:mb-10 md:mb-12 max-w-lg mx-auto px-2">
                Become a verified contributor to the global SSK database.
              </p>
              <div className="flex justify-center">
                <a 
                  href="tel:+918884449689" 
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-10 md:px-14 py-3.5 sm:py-5 md:py-6 bg-[#E65100] hover:bg-[#FF6600] rounded-full text-base sm:text-xl md:text-2xl font-bold tracking-tight transition-all shadow-[0_15px_40px_-10px_rgba(230,81,0,0.5)] active:scale-[0.98]"
                >
                  +91 888 444 9689
                </a>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
          </div>
        </section>

        {/* Volunteer Announcement Bar - Positioned directly below Join Registry */}
        <section className="pb-16 md:pb-24">
          <div className="container mx-auto px-4 md:px-6 mb-4 mt-8">
             <div className="flex flex-col items-center">
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-blue-500/60 mb-1">Our Dedicated Personnel</span>
                <h2 className="text-lg md:text-2xl font-cinzel uppercase tracking-[0.2em] text-white">Volunteers</h2>
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