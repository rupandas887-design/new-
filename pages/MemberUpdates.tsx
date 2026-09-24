import React, { useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import DashboardLayout from '../components/layout/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Member, MemberStatus } from '../types';
import { supabase } from '../supabase/client';
import { useNotification } from '../context/NotificationContext';
import { 
  Search, 
  User, 
  MapPin, 
  Skull, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  X,
  RefreshCw,
  History
} from 'lucide-react';

const MemberUpdates: React.FC = () => {
  const { addNotification } = useNotification();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [member, setMember] = useState<Member | null>(null);
  const [updateType, setUpdateType] = useState<'address' | 'deceased' | null>(null);
  
  // Address Change State
  const [newAddress, setNewAddress] = useState('');
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [addressPreview, setAddressPreview] = useState<string | null>(null);
  
  // Deceased State
  const [deathProof, setDeathProof] = useState<File | null>(null);
  const [deathPreview, setDeathPreview] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const deathInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setMember(null);
    setUpdateType(null);
    
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .or(`aadhaar.eq.${searchQuery},mobile.eq.${searchQuery}`)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        addNotification("Member not found in registry.", "error");
      } else {
        setMember(data as Member);
      }
    } catch (err: any) {
      addNotification(err.message || "Search failed.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'address' | 'death') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'address') {
        setAddressProof(file);
        if (addressPreview) URL.revokeObjectURL(addressPreview);
        setAddressPreview(URL.createObjectURL(file));
      } else {
        setDeathProof(file);
        if (deathPreview) URL.revokeObjectURL(deathPreview);
        setDeathPreview(URL.createObjectURL(file));
      }
    }
  };

  const uploadFile = async (file: File, prefix: string) => {
    const fileName = `${prefix}_${uuidv4()}.jpg`;
    const { data, error } = await supabase.storage.from('member-images').upload(fileName, file);
    if (error) throw new Error(`Storage Error: ${error.message}`);
    return supabase.storage.from('member-images').getPublicUrl(data.path).data.publicUrl;
  };

  const handleAddressUpdate = async () => {
    if (!member || !newAddress || !addressProof) {
      addNotification("Please provide new address and proof document.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const proofUrl = await uploadFile(addressProof, 'address_proof');
      
      const { error } = await supabase
        .from('members')
        .update({
          previous_address: member.address,
          address: newAddress,
          address_proof_url: proofUrl
        })
        .eq('id', member.id);

      if (error) throw error;

      addNotification("Address updated successfully.", "success");
      // Refresh member data
      setMember({ ...member, previous_address: member.address, address: newAddress, address_proof_url: proofUrl });
      setUpdateType(null);
      setNewAddress('');
      setAddressProof(null);
      setAddressPreview(null);
    } catch (err: any) {
      addNotification(err.message || "Update failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkDeceased = async () => {
    if (!member || !deathProof) {
      addNotification("Proof of death is required.", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const proofUrl = await uploadFile(deathProof, 'death_proof');
      
      const { error } = await supabase
        .from('members')
        .update({
          status: MemberStatus.Deceased,
          death_certificate_url: proofUrl
        })
        .eq('id', member.id);

      if (error) throw error;

      addNotification("Member status updated to Deceased.", "success");
      setMember({ ...member, status: MemberStatus.Deceased, death_certificate_url: proofUrl });
      setUpdateType(null);
      setDeathProof(null);
      setDeathPreview(null);
    } catch (err: any) {
      addNotification(err.message || "Update failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Member Updates Dashboard">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        {/* Search Section */}
        <Card className="bg-[#0a0c14] border-white/5 p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">Search Registry</label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input 
                    placeholder="Enter Aadhaar or Mobile Number" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-black/40"
                  />
                </div>
                <Button type="submit" disabled={isSearching} className="px-8">
                  {isSearching ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
                  <span className="ml-2">Search</span>
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {member && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Member Profile Card */}
            <Card className="bg-[#0a0c14] border-white/5 overflow-hidden">
              <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-3xl bg-orange-600/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                    <User size={40} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-cinzel font-bold text-white uppercase">{member.name} {member.surname}</h2>
                    <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">ID: {member.aadhaar}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        member.status === MemberStatus.Deceased 
                          ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                          : 'bg-green-500/10 text-green-500 border-green-500/20'
                      }`}>
                        {member.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="secondary" 
                    onClick={() => setUpdateType('address')}
                    className="text-[10px] font-black tracking-widest uppercase"
                    disabled={member.status === MemberStatus.Deceased}
                  >
                    <MapPin size={14} className="mr-2" />
                    Address Change
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => setUpdateType('deceased')}
                    className="text-[10px] font-black tracking-widest uppercase border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                    disabled={member.status === MemberStatus.Deceased}
                  >
                    <Skull size={14} className="mr-2" />
                    Mark Deceased
                  </Button>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-2">Current Address</p>
                    <p className="text-sm text-gray-300 leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                      {member.address}
                    </p>
                  </div>
                  {member.previous_address && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <History size={12} className="text-gray-600" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Previous Address</p>
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed bg-white/[0.02] p-4 rounded-2xl border border-white/5 italic">
                        {member.previous_address}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Mobile</p>
                      <p className="text-sm font-bold text-white">{member.mobile}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Father's Name</p>
                      <p className="text-sm font-bold text-white">{member.father_name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">Gender</p>
                      <p className="text-sm font-bold text-white">{member.gender}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 mb-1">DOB</p>
                      <p className="text-sm font-bold text-white">{member.dob}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Update Forms */}
            {updateType === 'address' && (
              <Card className="bg-[#0a0c14] border-orange-500/20 p-8 animate-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-600/10 rounded-xl text-orange-500">
                      <MapPin size={24} />
                    </div>
                    <h3 className="text-xl font-cinzel font-bold text-white uppercase">Address Relocation Update</h3>
                  </div>
                  <button onClick={() => setUpdateType(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-500">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  <Input 
                    label="NEW RESIDENTIAL ADDRESS *" 
                    value={newAddress} 
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter the complete new address"
                  />

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">PROOF OF ADDRESS CHANGE *</label>
                    <div 
                      onClick={() => addressInputRef.current?.click()}
                      className="relative border-2 border-dashed border-white/10 rounded-[2rem] bg-black/40 aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 transition-all overflow-hidden"
                    >
                      {addressPreview ? (
                        <img src={addressPreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-gray-600">
                          <Upload size={48} strokeWidth={1} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Upload Document (JPG/PNG)</span>
                        </div>
                      )}
                      <input 
                        ref={addressInputRef} 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, 'address')} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={() => setUpdateType(null)}>Cancel</Button>
                    <Button onClick={handleAddressUpdate} disabled={isSubmitting} className="px-12">
                      {isSubmitting ? <RefreshCw className="animate-spin mr-2" size={18} /> : <CheckCircle2 className="mr-2" size={18} />}
                      Update Registry
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {updateType === 'deceased' && (
              <Card className="bg-[#0a0c14] border-red-500/20 p-8 animate-in slide-in-from-top-4 duration-500">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-600/10 rounded-xl text-red-500">
                      <Skull size={24} />
                    </div>
                    <h3 className="text-xl font-cinzel font-bold text-white uppercase">Deceased Status Registry</h3>
                  </div>
                  <button onClick={() => setUpdateType(null)} className="p-2 hover:bg-white/5 rounded-full text-gray-500">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="p-6 bg-red-600/5 border border-red-500/10 rounded-2xl flex items-start gap-4">
                    <AlertCircle className="text-red-500 shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Critical Action Required</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1 leading-relaxed">
                        Marking a member as deceased is an irreversible registry action. A valid death certificate or official proof must be uploaded.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">PROOF OF DEATH / CERTIFICATE *</label>
                    <div 
                      onClick={() => deathInputRef.current?.click()}
                      className="relative border-2 border-dashed border-white/10 rounded-[2rem] bg-black/40 aspect-video flex flex-col items-center justify-center cursor-pointer hover:border-red-500/50 transition-all overflow-hidden"
                    >
                      {deathPreview ? (
                        <img src={deathPreview} className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center gap-4 text-gray-600">
                          <FileText size={48} strokeWidth={1} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Upload Certificate (JPG/PNG)</span>
                        </div>
                      )}
                      <input 
                        ref={deathInputRef} 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, 'death')} 
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-4 pt-4">
                    <Button variant="secondary" onClick={() => setUpdateType(null)}>Cancel</Button>
                    <Button onClick={handleMarkDeceased} disabled={isSubmitting} className="px-12 bg-red-600 hover:bg-red-700 border-red-600">
                      {isSubmitting ? <RefreshCw className="animate-spin mr-2" size={18} /> : <Skull className="mr-2" size={18} />}
                      Finalize Deceased Status
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {!member && !isSearching && searchQuery && (
          <div className="py-20 flex flex-col items-center justify-center text-gray-700 space-y-4">
            <AlertCircle size={48} strokeWidth={1} />
            <p className="text-[10px] font-black uppercase tracking-[0.5em]">No Registry Match Found</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberUpdates;
