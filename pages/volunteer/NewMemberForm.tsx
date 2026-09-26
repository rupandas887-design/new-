import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import { Gender, Occupation, SupportNeed, MaritalStatus, Qualification } from '../../types';
import { supabase } from '../../supabase/client';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { syncToSheets, SheetType } from '../../services/googleSheets';
import { ShieldAlert, RefreshCw, ShieldCheck, Search, Check, Loader2, AlertCircle } from 'lucide-react';

const initialFormData = {
  aadhaar: '',
  mobile: '',
  name: '',
  surname: '',
  fatherName: '',
  dob: '',
  gender: '' as unknown as Gender,
  maritalStatus: '' as unknown as MaritalStatus,
  qualification: '' as unknown as Qualification,
  emergencyContact: '',
  pincode: '',
  address: '',
  aadhaarPhoto: null as File | null,
  occupation: '' as unknown as Occupation,
  supportNeed: '' as unknown as SupportNeed,
};

type AadhaarCheckStatus = 'idle' | 'checking' | 'verified' | 'duplicate' | 'error';

const NewMemberForm: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Aadhaar duplicate checking state
  const [aadhaarStatus, setAadhaarStatus] = useState<AadhaarCheckStatus>('idle');
  const [aadhaarError, setAadhaarError] = useState('');

  // Diagnostic: Check if organization link is broken (ID exists but Name doesn't return from join)
  const isLinkBroken = Boolean(user?.organisationId && !user?.organisationName);

  // Auto check duplicate Identification (Aadhaar) number whenever 12 digits are entered
  useEffect(() => {
    const rawVal = (formData.aadhaar || '').trim();
    
    // Only check when exactly 12 numeric digits are entered
    if (rawVal.length !== 12 || !/^\d{12}$/.test(rawVal)) {
      setAadhaarStatus('idle');
      setAadhaarError('');
      return;
    }

    let isCurrent = true;
    setAadhaarStatus('checking');
    setAadhaarError('');

    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('id')
          .eq('aadhaar', rawVal)
          .maybeSingle();

        if (!isCurrent) return;

        if (error) {
          console.error("Duplicate verification error:", error);
          setAadhaarStatus('error');
          setAadhaarError('Unable to verify identification. Please try again.');
          return;
        }

        if (data) {
          setAadhaarStatus('duplicate');
          setAadhaarError('This Aadhaar number is already registered.');
        } else {
          setAadhaarStatus('verified');
          setAadhaarError('');
        }
      } catch (err: any) {
        if (!isCurrent) return;
        console.error("Duplicate check error:", err);
        setAadhaarStatus('error');
        setAadhaarError('Unable to verify identification. Please try again.');
      }
    }, 200);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [formData.aadhaar]);

  const renderAadhaarStatusIcon = () => {
    if (aadhaarStatus === 'checking') {
      return (
        <Loader2 size={18} className="text-orange-500 animate-spin" />
      );
    }
    if (aadhaarStatus === 'verified') {
      return (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
          <Check size={12} strokeWidth={3} />
        </div>
      );
    }
    if (aadhaarStatus === 'duplicate' || aadhaarStatus === 'error') {
      return (
        <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
          <AlertCircle size={13} strokeWidth={2.5} />
        </div>
      );
    }
    return null;
  };

  const formatInput = (text: string) => {
    return (text || '').trim().toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if ((name === 'aadhaar' || name === 'mobile' || name === 'emergencyContact' || name === 'pincode') && value !== '' && !/^\d+$/.test(value)) return;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStep1Next = async () => {
    setValidationError('');
    
    // Safety check for organization linkage
    if (!user?.organisationId || isLinkBroken) {
      setValidationError(`Linkage Fault: Your account is linked to an ID (${user?.organisationId?.slice(0,8)}) that does not exist in the master registry or has been purged.`);
      return;
    }

    if (!formData.aadhaar || !formData.mobile) {
      setValidationError('Action Required: Identity Number and Primary Mobile are mandatory.');
      return;
    }
    if (!/^\d{12}$/.test(formData.aadhaar)) {
      setValidationError('UID must be exactly 12 numeric digits.');
      return;
    }
    if (!/^\d{10}$/.test(formData.mobile)) {
      setValidationError('Mobile must be exactly 10 numeric digits.');
      return;
    }

    if (aadhaarStatus === 'duplicate') {
      setValidationError('This Aadhaar number is already registered.');
      return;
    }

    if (aadhaarStatus === 'checking') {
      setValidationError('Please wait for identification verification to complete.');
      return;
    }

    if (aadhaarStatus === 'error') {
      setValidationError('Unable to verify identification. Please try again.');
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase
        .from('members')
        .select('id')
        .eq('aadhaar', formData.aadhaar.trim())
        .maybeSingle();
      
      if (error) {
        setValidationError(`Uplink Error: ${error.message}`);
        return;
      }

      if (data) {
        setAadhaarStatus('duplicate');
        setAadhaarError('This Aadhaar number is already registered.');
        setValidationError('This Aadhaar number is already registered.');
      } else {
        setAadhaarStatus('verified');
        setAadhaarError('');
        setStep(2);
        window.scrollTo(0, 0);
      }
    } catch (e: any) {
      setValidationError(`System Fault: ${e.message || 'Access Denied'}`);
    } finally {
      setIsValidating(false);
    }
  };

  const handleStep2Next = () => {
    setValidationError('');
    if (!formData.name || !formData.surname || !formData.fatherName || !formData.dob || !formData.gender || !formData.maritalStatus || !formData.qualification || !formData.emergencyContact || !formData.pincode || !formData.address) {
      setValidationError('Action Required: All fields including Gender, Marital Status, and Qualification are mandatory.');
      return;
    }
    
    if (!/^\d{10}$/.test(formData.emergencyContact)) {
      setValidationError('Emergency Contact must be 10 digits.');
      return;
    }

    if (formData.mobile === formData.emergencyContact) {
      setValidationError('Conflict: Mobile and Emergency Contact cannot be identical.');
      return;
    }

    if (!/^\d{6}$/.test(formData.pincode)) {
      setValidationError('Pincode must be exactly 6 digits.');
      return;
    }

    setStep(3);
    window.scrollTo(0, 0);
  };

  const uploadFile = async (file: File) => {
    const fileName = `aadhaar_${uuidv4()}.jpg`;
    const { data, error } = await supabase.storage.from('member-images').upload(fileName, file);
    if (error) throw new Error(`Storage Error: ${error.message}`);
    return supabase.storage.from('member-images').getPublicUrl(data.path).data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.organisationId || isLinkBroken || !user?.id) {
      addNotification("Registry Fault: Organization Linkage Missing or Invalid. Please contact Admin.", "error");
      return;
    }

    if (!formData.occupation || !formData.supportNeed) {
      setValidationError('Action Required: Occupation and Support Need selections are mandatory.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const photoUrl = formData.aadhaarPhoto ? await uploadFile(formData.aadhaarPhoto) : '';

      const memberPayload = {
        aadhaar: (formData.aadhaar || '').trim(),
        mobile: (formData.mobile || '').trim(),
        name: formatInput(formData.name),
        surname: formatInput(formData.surname),
        father_name: formatInput(formData.fatherName),
        dob: formData.dob,
        gender: formData.gender,
        marital_status: formData.maritalStatus,
        qualification: formData.qualification,
        emergency_contact: (formData.emergencyContact || '').trim(),
        pincode: (formData.pincode || '').trim(),
        address: (formData.address || '').trim(),
        aadhaar_front_url: photoUrl,
        aadhaar_back_url: photoUrl, 
        occupation: formData.occupation,
        support_need: formData.supportNeed,
        volunteer_id: user.id,
        organisation_id: user.organisationId,
        submission_date: new Date().toISOString(),
        status: 'Pending'
      };

      const { error: dbError } = await supabase.from('members').insert(memberPayload);
      
      if (dbError) {
        if (dbError.code === '23505') {
          const msg = 'This Aadhaar number is already registered.';
          setAadhaarStatus('duplicate');
          setAadhaarError(msg);
          setValidationError(msg);
          throw new Error(msg);
        }
        if (dbError.code === '23503') {
          const msg = `Critical Linkage Fault: Organization ID (${user.organisationId}) is invalid or has been purged from the master registry. Please contact support.`;
          setValidationError(msg);
          throw new Error(msg);
        }
        throw new Error(`Database Synchronization Error: ${dbError.message}`);
      }

      syncToSheets(SheetType.MEMBERS, {
        ...memberPayload,
        volunteer_name: user.name,
        organisation_name: user.organisationName,
        submission_date: new Date().toLocaleDateString()
      }).catch(err => console.error("Sheet Sync Failed:", err));

      addNotification("Identity record synchronized successfully.", 'success');
      setFormData(initialFormData);
      setAadhaarStatus('idle');
      setAadhaarError('');
      setStep(1);
      window.scrollTo(0, 0);
    } catch (err: any) {
      console.error("Submission Fault:", err);
      addNotification(err.message || "Registry Fault: Synchronization Interrupted.", 'error');
      setValidationError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Identity Enrollment Hub" hideHeader={true}>
      <div className="w-full max-w-4xl mx-auto space-y-6 sm:space-y-8 md:space-y-10 pb-16 sm:pb-20 px-1 sm:px-2 pt-2 sm:pt-4">
        {(isLinkBroken || (user && !user?.organisationId)) && (
          <div className="p-5 sm:p-6 bg-red-600/10 border border-red-500/20 rounded-2xl sm:rounded-3xl flex items-start gap-4 text-red-400">
            <ShieldAlert size={24} className="shrink-0 mt-1 text-red-500" />
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-widest">Critical System Error: Broken Registry Link</p>
              <p className="text-[10px] text-gray-400 leading-relaxed font-bold uppercase tracking-wider">
                The organization ID associated with your profile ({user?.organisationId || 'Unlinked'}) does not exist in the master registry. <br />
                Enrollment is locked. Please contact the Master Admin to re-link your account.
              </p>
            </div>
          </div>
        )}

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
          {step === 1 && (
            <div className="max-w-xl mx-auto py-2 sm:py-4">
              <Card className="relative bg-[#0a0c14] border-white/10 border p-0 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)]">
                <div className="p-6 sm:p-8 md:p-12 space-y-8 sm:space-y-10">
                  <div className="flex items-center gap-4 sm:gap-6 mb-2 sm:mb-4">
                    <div className="p-3.5 sm:p-4 bg-orange-500/10 rounded-2xl text-orange-500 border border-orange-500/20 shadow-inner shrink-0">
                      <ShieldCheck size={28} />
                    </div>
                    <div>
                      {/* Form Naming Change: Validation Step renamed to Registry Clearance */}
                      <h3 className="text-lg sm:text-2xl font-cinzel text-white uppercase tracking-wider">Registry Clearance</h3>
                    </div>
                  </div>
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <Input 
                        label="IDENTIFICATION (12 DIGITS) *" 
                        name="aadhaar" 
                        value={formData.aadhaar} 
                        onChange={handleChange} 
                        maxLength={12} 
                        placeholder="Aadhaar Number" 
                        required 
                        rightElement={renderAadhaarStatusIcon()}
                        isError={aadhaarStatus === 'duplicate' || aadhaarStatus === 'error'}
                        isSuccess={aadhaarStatus === 'verified'}
                      />
                      {aadhaarStatus === 'verified' && (
                        <div className="flex items-center gap-2 mt-2 pl-1 animate-in fade-in duration-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                          <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                            Identification verified.
                          </p>
                        </div>
                      )}
                      {aadhaarError && (
                        <div className="flex items-center gap-2 mt-2 pl-1 animate-in fade-in duration-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                          <p className="text-xs text-red-400 font-bold uppercase tracking-wider">
                            {aadhaarError}
                          </p>
                        </div>
                      )}
                    </div>

                    <Input label="MOBILE NUMBER *" name="mobile" type="tel" value={formData.mobile} onChange={handleChange} maxLength={10} placeholder="Primary Mobile" required />
                    
                    {validationError && !aadhaarError && (
                      <div className="p-4 sm:p-5 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                        <ShieldAlert size={16} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-400 font-bold uppercase tracking-wider leading-relaxed">{validationError}</p>
                      </div>
                    )}
                  </div>
                  <div className="pt-4 sm:pt-6">
                    <Button 
                      onClick={handleStep1Next} 
                      disabled={
                        isValidating || 
                        aadhaarStatus === 'checking' || 
                        aadhaarStatus === 'duplicate' || 
                        aadhaarStatus === 'error' || 
                        (formData.aadhaar.length === 12 && aadhaarStatus !== 'verified') ||
                        !formData.aadhaar || 
                        formData.aadhaar.length !== 12 || 
                        !formData.mobile || 
                        formData.mobile.length !== 10 || 
                        !user?.organisationId || 
                        isLinkBroken
                      } 
                      className="w-full py-4 sm:py-5 text-[11px] font-black uppercase tracking-[0.35em] sm:tracking-[0.4em] flex items-center justify-center gap-3 sm:gap-4"
                    >
                      {isValidating ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                      {isValidating ? 'VALIDATING...' : 'AUTHORIZE ACCESS'}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          )}
          
          {step === 2 && (
            <Card title="Citizen Identity File" className="bg-[#0a0c14] border-white/10 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-14 shadow-2xl relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-8 sm:mb-12">
                <Input label="Full Name *" name="name" value={formData.name} onChange={handleChange} placeholder="First Name" required />
                <Input label="Gharano *" name="surname" value={formData.surname} onChange={handleChange} placeholder="Last Name" required />
                <Input label="Father / Guardian / Husband Name *" name="fatherName" value={formData.fatherName} onChange={handleChange} description="Maintained separately from primary identity name." required />
                <Input label="DATE OF BIRTH *" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                <Select label="BIOLOGICAL GENDER *" name="gender" value={formData.gender} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  {Object.values(Gender).map(g => <option key={g} value={g}>{g}</option>)}
                </Select>
                <Select label="MARITAL STATUS *" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange}>
                  <option value="">Select Marital Status</option>
                  {Object.values(MaritalStatus).map(m => <option key={m} value={m}>{m}</option>)}
                </Select>
                <Select label="QUALIFICATION *" name="qualification" value={formData.qualification} onChange={handleChange}>
                  <option value="">Select Qualification</option>
                  {Object.values(Qualification).map(q => <option key={q} value={q}>{q}</option>)}
                </Select>
                <Input label="EMERGENCY CONTACT *" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} maxLength={10} required />
                <Input label="PINCODE *" name="pincode" value={formData.pincode} onChange={handleChange} maxLength={6} required />
                <div className="md:col-span-2">
                  <Input label="FULL ADDRESS *" name="address" value={formData.address} onChange={handleChange} placeholder="Residential address" required />
                </div>
              </div>
              
              {validationError && (
                <div className="mt-8 sm:mt-12 flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-start">
                  <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 font-bold uppercase tracking-widest leading-relaxed">{validationError}</p>
                </div>
              )}

              <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                <Button variant="secondary" onClick={() => { setStep(1); window.scrollTo(0, 0); }} className="w-full sm:w-auto py-3.5 sm:py-4 px-8 sm:px-10">Back</Button>
                <Button onClick={handleStep2Next} className="w-full sm:w-auto py-3.5 sm:py-4 px-10 sm:px-12">Review Registry</Button>
              </div>
            </Card>
          )}
          
          {step === 3 && (
            <Card title="Review Node" className="bg-[#0a0c14] border-white/10 rounded-2xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-14 shadow-2xl">
              <div className="space-y-8 sm:space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                  <Select label="What do they do? *" name="occupation" value={formData.occupation} onChange={handleChange}>
                    <option value="">Select Occupation</option>
                    {Object.values(Occupation).map(o => <option key={o} value={o}>{o}</option>)}
                  </Select>
                  <Select label="What do they want? *" name="supportNeed" value={formData.supportNeed} onChange={handleChange}>
                    <option value="">Select Support Need</option>
                    {Object.values(SupportNeed).map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </div>
                <div className="p-6 sm:p-8 bg-orange-600/5 border border-orange-500/10 rounded-2xl sm:rounded-[2rem] flex flex-col md:flex-row items-start gap-5 sm:gap-8">
                  <div className="p-3.5 sm:p-4 bg-orange-500/10 rounded-2xl text-orange-500 shrink-0">
                    <ShieldCheck size={32} className="sm:size-9" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <h4 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight">Identity Certification</h4>
                    <p className="text-[10px] sm:text-[11px] text-gray-500 leading-relaxed uppercase tracking-[0.2em] font-bold">
                      I certify that I have physically verified the Full Name and Gharano of this citizen against legal documentation. Direct nominal registry verification is certified for this record.
                    </p>
                  </div>
                </div>
              </div>
              {validationError && (
                <div className="mt-8 sm:mt-10 flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-red-600/10 border border-red-500/20 rounded-2xl flex items-start">
                  <ShieldAlert size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-400 font-bold uppercase tracking-widest leading-relaxed">{validationError}</p>
                </div>
              )}
              <div className="mt-10 sm:mt-16 flex flex-col sm:flex-row justify-between gap-4 sm:gap-6">
                <Button variant="secondary" onClick={() => { setStep(2); window.scrollTo(0, 0); }} className="w-full sm:w-auto py-3.5 sm:py-4 px-8 sm:px-10">Modify Profile</Button>
                <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full sm:w-auto py-4 sm:py-5 px-10 sm:px-16 text-[11px] sm:text-[12px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em]">
                  {isSubmitting ? 'SYNCHRONIZING...' : 'FINALIZE REGISTRATION'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default NewMemberForm;