import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Briefcase, TrendingUp, Search, Clock, MapPin, 
  DollarSign, ExternalLink, Trash2, BarChart2, Folder, 
  Globe, User, AlertCircle, RefreshCw, CheckCircle, 
  XCircle, Calendar as CalendarIcon, Activity 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend
} from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './index.css';

export default function CareerFlowTracker({ logout }) {
  const [jobs, setJobs] = useState([]);
  const [activeView, setActiveView] = useState('analytics'); // Default view
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [date, setDate] = useState(new Date());
  
  // Live Jobs State
  const [liveJobs, setLiveJobs] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [liveError, setLiveError] = useState(false);
  
  const initialFormState = {
    company: '', position: '', location: '', salary: '', 
    status: 'applied', jobType: 'Full-time', remote: 'On-site', 
    notes: '', url: '', contactPerson: '', 
    appliedDate: new Date().toISOString().split('T')[0], 
    deadline: '',
    nextRoundDate: ''
  };
  const [newJob, setNewJob] = useState(initialFormState);

  // --- API CONNECTIONS ---
  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    if (activeView === 'discovery') {
        fetchLiveJobs();
    }
  }, [activeView]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/jobs');
      setJobs(res.data);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchLiveJobs = async () => {
    setLoadingLive(true);
    setLiveError(false);
    try {
      const res = await axios.get('http://localhost:5000/api/recommendations');
      setLiveJobs(res.data);
    } catch (error) {
      console.error("Error fetching live jobs:", error);
      setLiveError(true);
    }
    setLoadingLive(false);
  };

  const handleAddJob = async () => {
    if (newJob.company && newJob.position) {
      try {
        await axios.post('http://localhost:5000/jobs', newJob);
        setShowAddModal(false);
        setNewJob(initialFormState);
        fetchJobs(); 
      } catch (error) {
        alert("Failed to save. Make sure Backend is running!");
      }
    } else {
        alert("Company and Position are required!");
    }
  };

  const handleDeleteJob = async (id) => {
    try {
        setJobs(jobs.filter(job => job._id !== id));
        setSelectedJob(null);
        await axios.delete(`http://localhost:5000/jobs/${id}`);
        fetchJobs();
    } catch (error) {
        console.error("Error deleting", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
        await axios.put(`http://localhost:5000/jobs/${id}`, { status: newStatus });
        fetchJobs();
        if(selectedJob) setSelectedJob({...selectedJob, status: newStatus});
    } catch (error) {
        console.error("Error updating", error);
    }
  };

  // --- CONFIGURATION ---
  const statuses = [
    { id: 'applied', label: 'Applied', color: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-600', bgLight: 'bg-indigo-50' },
    { id: 'ot', label: 'Online Test', color: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-600', bgLight: 'bg-purple-50' },
    { id: 'interview', label: 'Interview', color: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-600', bgLight: 'bg-amber-50' },
    { id: 'offer', label: 'Offer', color: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-600', bgLight: 'bg-emerald-50' },
    { id: 'rejected', label: 'Rejected', color: '#ef4444', bg: 'bg-rose-500', text: 'text-rose-600', bgLight: 'bg-rose-50' }
  ];

  const getFilteredJobs = () => {
    return jobs.filter(job =>
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const getStatusCount = (status) => jobs.filter(job => job.status === status).length;

  // --- ANALYTICS DATA ---
  const funnelData = statuses.map(s => ({
    name: s.label,
    count: getStatusCount(s.id),
    fill: s.color
  }));

  const pieData = funnelData.filter(d => d.count > 0);

  const totalApps = jobs.length;
  const offerCount = getStatusCount('offer');
  const rejectedCount = getStatusCount('rejected');
  
  const interviewRate = totalApps > 0 
    ? (((getStatusCount('interview') + offerCount) / totalApps) * 100).toFixed(0) 
    : 0;
  
  // Recent Activity (Sort by Updated Date so changes float to top)
  const recentActivity = [...jobs]
    .sort((a, b) => new Date(b.updatedAt || b.appliedDate) - new Date(a.updatedAt || a.appliedDate))
    .slice(0, 5);

  // --- CALENDAR LOGIC ---
  const tileContent = ({ date, view }) => {
    if (view === 'month') {
        const hasEvent = jobs.find(job => {
            if (!job.nextRoundDate) return false;
            const jobDate = new Date(job.nextRoundDate);
            return jobDate.getDate() === date.getDate() && 
                   jobDate.getMonth() === date.getMonth() && 
                   jobDate.getFullYear() === date.getFullYear();
        });
        if (hasEvent) return <div className="h-1.5 w-1.5 bg-purple-600 rounded-full mx-auto mt-1"></div>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10 shadow-sm">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Briefcase className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">CareerFlow</h1>
              <p className="text-xs text-slate-500 font-medium">Job Tracker Pro</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 flex flex-col">
          <button onClick={() => setActiveView('pipeline')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === 'pipeline' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Folder size={18} /> Pipeline
          </button>
          <button onClick={() => setActiveView('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <BarChart2 size={18} /> Analytics
          </button>
          <button onClick={() => setActiveView('discovery')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === 'discovery' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Globe size={18} /> Job Discovery
          </button>

          <div className="mt-auto pt-4">
             <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                User: {localStorage.getItem('careerFlowUser') || 'Guest'}
             </p>
             <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-slate-50 transition-colors">
                <ExternalLink size={18} /> Logout
             </button>
          </div>
        </nav>

        {/* CALENDAR */}
        <div className="p-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Schedule</p>
            <div className="bg-slate-50 rounded-xl p-2 border border-slate-200 shadow-inner">
                <Calendar 
                    onChange={setDate} 
                    value={date} 
                    tileContent={tileContent}
                    className="text-xs border-none bg-transparent w-full custom-calendar"
                    next2Label={null}
                    prev2Label={null}
                />
            </div>
        </div>

        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold uppercase">JT</div>
            <div className="flex-1">
              <p className="text-sm font-bold text-slate-900">Jeevan Tadwal</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-72 overflow-hidden bg-slate-50">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {activeView === 'pipeline' ? 'Application Pipeline' : activeView === 'analytics' ? 'Performance Analytics' : 'Job Discovery'}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {activeView === 'pipeline' ? 'Manage your applications' : activeView === 'analytics' ? 'Visualize your progress' : 'Find your next role'}
              </p>
            </div>
            {activeView === 'pipeline' && (
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search companies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 bg-slate-50" />
              </div>
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-indigo-100 transition-all">
                <Plus size={18} /> New Application
              </button>
            </div>
            )}
        </div>

        {/* --- VIEW: ANALYTICS (RESTORED TO ANLYSIS01.PNG DESIGN) --- */}
        {activeView === 'analytics' && (
          <div className="p-8 overflow-y-auto h-full pb-20">
            
            {/* 1. TOP ROW: 4 KPI CARDS */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                {/* Total */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-blue-50 rounded-lg"><Briefcase className="text-blue-600 w-5 h-5"/></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
                    </div>
                    <div><h3 className="text-3xl font-bold text-slate-900">{totalApps}</h3><p className="text-xs text-slate-500">Applications</p></div>
                </div>
                {/* Response Rate */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-purple-50 rounded-lg"><TrendingUp className="text-purple-600 w-5 h-5"/></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Response</span>
                    </div>
                    <div><h3 className="text-3xl font-bold text-slate-900">{interviewRate}%</h3><p className="text-xs text-slate-500">Interview Rate</p></div>
                </div>
                {/* Success */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-green-50 rounded-lg"><CheckCircle className="text-green-600 w-5 h-5"/></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Success</span>
                    </div>
                    <div><h3 className="text-3xl font-bold text-slate-900">{offerCount}</h3><p className="text-xs text-slate-500">Offers Received</p></div>
                </div>
                {/* Rejected */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-red-50 rounded-lg"><XCircle className="text-red-600 w-5 h-5"/></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected</span>
                    </div>
                    <div><h3 className="text-3xl font-bold text-slate-900">{rejectedCount}</h3><p className="text-xs text-slate-500">Keep Going!</p></div>
                </div>
            </div>

            {/* 2. MIDDLE ROW: PIE CHART + BAR CHART */}
            <div className="grid grid-cols-2 gap-6 mb-8">
                {/* Donut Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Pipeline Distribution</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count">
                                    {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Horizontal Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Status Breakdown</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={100} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f1f5f9'}} />
                                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                                    {funnelData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. BOTTOM ROW: RECENT ACTIVITY */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Activity className="text-indigo-600 w-5 h-5" />
                    <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
                </div>
                <div className="space-y-3">
                    {recentActivity.length > 0 ? (
                        recentActivity.map((job) => (
                            <div key={job._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-lg font-bold text-slate-700">
                                        {job.company.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{job.company}</h4>
                                        <p className="text-xs text-slate-500">{job.position}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full 
                                        ${job.status === 'rejected' ? 'bg-red-100 text-red-600' : 
                                          job.status === 'offer' ? 'bg-green-100 text-green-600' : 
                                          'bg-slate-200 text-slate-600'}`}>
                                        {job.status.toUpperCase()}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 justify-end">
                                        <Clock size={10} />
                                        {new Date(job.updatedAt || job.appliedDate).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-400 text-sm text-center py-4">No recent activity found. Add a job to start tracking!</p>
                    )}
                </div>
            </div>

          </div>
        )}

        {/* JOB DISCOVERY */}
        {activeView === 'discovery' && (
            <div className="p-8 h-full overflow-y-auto pb-20">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
                    <h3 className="text-3xl font-bold mb-2">Live Job Market 🌍</h3>
                    <p className="opacity-90">Real-time developer opportunities fetched from RemoteOK API.</p>
                </div>
                {loadingLive && <div className="text-center py-20 text-slate-400"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div><p>Fetching latest opportunities...</p></div>}
                {liveError && (
                    <div className="text-center py-20 text-red-500 bg-red-50 rounded-xl border border-red-100">
                        <AlertCircle className="w-10 h-10 mx-auto mb-2"/>
                        <p className="font-bold text-lg">Failed to load jobs.</p>
                        <p className="text-sm mb-4">Check if your Backend Server (`node server.js`) is running.</p>
                        <button onClick={fetchLiveJobs} className="flex items-center gap-2 mx-auto px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"><RefreshCw size={18}/> Retry Connection</button>
                    </div>
                )}
                {!loadingLive && !liveError && liveJobs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {liveJobs.map((job) => (
                            <div key={job.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-lg transition-all hover:border-indigo-300 group flex flex-col h-full">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-white flex-shrink-0">
                                            <img src={job.logo} alt={job.company} className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                            <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg" style={{display: 'none'}}>{job.company ? job.company.charAt(0).toUpperCase() : '?'}</div>
                                        </div>
                                        <div><h4 className="font-bold text-slate-900 line-clamp-1">{job.company}</h4><p className="text-xs text-slate-500">{new Date(job.date).toLocaleDateString()}</p></div>
                                    </div>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 mb-2 line-clamp-2 h-14">{job.position}</h3>
                                <div className="flex flex-wrap gap-2 mb-4 flex-1 content-start">
                                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded flex items-center gap-1"><MapPin size={10}/> {job.location || "Remote"}</span>
                                    {job.tags && job.tags.slice(0, 2).map((tag, idx) => (<span key={idx} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 uppercase">{tag}</span>))}
                                </div>
                                <div className="pt-4 border-t border-slate-100 mt-auto flex gap-3">
                                    <a href={job.url} target="_blank" rel="noreferrer" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-center py-2.5 rounded-lg text-sm font-medium transition shadow-md shadow-indigo-100">Apply Now 🚀</a>
                                    <button onClick={() => {setShowAddModal(true); setNewJob({...initialFormState, company: job.company, position: job.position, location: job.location || "Remote", url: job.url, notes: `Source: Job Discovery`});}} className="p-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition" title="Add to Pipeline"><Plus size={18} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* PIPELINE (Kanban) */}
        {activeView === 'pipeline' && (
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-8">
          <div className="flex gap-6 h-full min-w-[1500px]">
            {statuses.map(status => (
              <div key={status.id} className="flex flex-col w-72 bg-slate-100/80 rounded-xl border border-slate-200/60">
                <div className={`flex items-center justify-between p-4 mb-2 rounded-t-xl bg-white border-b border-slate-200`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${status.bgLight.replace('bg-', 'bg-')}`} style={{backgroundColor: status.color}}></div>
                    <h3 className="font-bold text-slate-700">{status.label}</h3>
                  </div>
                  <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-md border border-slate-200">{getStatusCount(status.id)}</span>
                </div>
                <div className="space-y-3 overflow-y-auto px-3 pb-4 flex-1">
                  {getFilteredJobs().filter(job => job.status === status.id).map(job => (
                    <div key={job._id || job.id} onClick={() => setSelectedJob(job)} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group relative">
                      <div className="flex justify-between items-start mb-2">
                        <div><h4 className="font-bold text-slate-900 text-base">{job.company}</h4><p className="text-xs font-medium text-slate-500">{job.position}</p></div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 flex items-center gap-1"><MapPin size={10}/> {job.location || 'Remote'}</span>
                        {job.salary && <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded border border-green-100 flex items-center gap-1"><DollarSign size={10}/> {job.salary}</span>}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-1"><Clock size={12}/> {job.appliedDate ? new Date(job.appliedDate).toLocaleDateString() : 'N/A'}</div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e)=>e.stopPropagation()}>
                            <button onClick={()=>handleStatusChange(job._id, statuses[statuses.findIndex(s=>s.id===status.id)+1]?.id)} className="p-1 hover:bg-indigo-50 text-indigo-500 rounded font-bold">→</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>

      {/* MODALS */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/20 backdrop-blur-[1px]" onClick={() => setSelectedJob(null)}>
            <div className="w-[500px] bg-white h-full shadow-2xl p-8 overflow-y-auto border-l border-slate-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-8">
                    <div><h2 className="text-3xl font-bold text-slate-900">{selectedJob.company}</h2><p className="text-xl text-indigo-600 font-medium">{selectedJob.position}</p></div>
                    <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">✕</button>
                </div>
                <div className="space-y-8">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Current Status</label>
                        <select value={selectedJob.status} onChange={(e) => handleStatusChange(selectedJob._id, e.target.value)} className="w-full p-2 bg-white border border-slate-200 rounded-lg font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">{statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1">Location</label><p className="text-sm font-semibold text-slate-800">{selectedJob.location || 'Not Specified'}</p></div>
                        <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1">Salary</label><p className="text-sm font-semibold text-slate-800">{selectedJob.salary || 'Not Specified'}</p></div>
                        <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1">Work Mode</label><p className="text-sm font-semibold text-slate-800">{selectedJob.remote}</p></div>
                        <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1">Job Type</label><p className="text-sm font-semibold text-slate-800">{selectedJob.jobType}</p></div>
                        <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1">Applied Date</label><p className="text-sm font-semibold text-slate-800">{selectedJob.appliedDate ? new Date(selectedJob.appliedDate).toLocaleDateString() : 'N/A'}</p></div>
                        {selectedJob.deadline && <div><label className="text-xs text-slate-400 font-bold uppercase block mb-1 text-red-400">Deadline</label><p className="text-sm font-semibold text-red-600">{new Date(selectedJob.deadline).toLocaleDateString()}</p></div>}
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                        <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider block mb-2">Next Scheduled Round</label>
                        {selectedJob.nextRoundDate ? (
                            <p className="text-sm font-bold text-indigo-700 flex items-center gap-2"><CalendarIcon size={16}/> {new Date(selectedJob.nextRoundDate).toLocaleDateString()}</p>
                        ) : <p className="text-sm text-slate-400 italic">No interview scheduled</p>}
                    </div>
                    <div><label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Notes</label><div className="p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-yellow-800 min-h-[80px] whitespace-pre-wrap">{selectedJob.notes || "No notes added yet."}</div></div>
                    <div className="pt-6 border-t border-slate-100 flex gap-3"><button onClick={() => handleDeleteJob(selectedJob._id)} className="px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition flex items-center gap-2"><Trash2 size={20}/> Delete Application</button></div>
                </div>
            </div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900">Add New Application</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Company Name *</label><input type="text" value={newJob.company} onChange={(e) => setNewJob({ ...newJob, company: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" placeholder="e.g. Google" /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Position *</label><input type="text" value={newJob.position} onChange={(e) => setNewJob({ ...newJob, position: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" placeholder="e.g. Software Engineer" /></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Location</label><input type="text" value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" placeholder="e.g. San Francisco, CA" /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Salary Range</label><input type="text" value={newJob.salary} onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" placeholder="e.g. $120k - $150k" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Job Type</label><select value={newJob.jobType} onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white"><option>Full-time</option><option>Part-time</option><option>Internship</option><option>Contract</option></select></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Work Mode</label><select value={newJob.remote} onChange={(e) => setNewJob({ ...newJob, remote: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white"><option>On-site</option><option>Remote</option><option>Hybrid</option></select></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Status</label><select value={newJob.status} onChange={(e) => setNewJob({ ...newJob, status: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg bg-white">{statuses.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Applied Date</label><input type="date" value={newJob.appliedDate} onChange={(e) => setNewJob({ ...newJob, appliedDate: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-2">Deadline</label><input type="date" value={newJob.deadline} onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-indigo-600 mb-2">Schedule Next Round</label><input type="date" value={newJob.nextRoundDate} onChange={(e) => setNewJob({ ...newJob, nextRoundDate: e.target.value })} className="w-full px-4 py-2.5 border border-indigo-200 bg-indigo-50 rounded-lg" /></div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-2">Notes</label><textarea value={newJob.notes} onChange={(e) => setNewJob({ ...newJob, notes: e.target.value })} rows="3" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" placeholder="Notes..."></textarea></div>
              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button onClick={() => setShowAddModal(false)} className="flex-1 py-3 border border-slate-200 rounded-lg font-semibold text-slate-600 hover:bg-slate-50 transition">Cancel</button>
                <button onClick={handleAddJob} className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Save Application</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}