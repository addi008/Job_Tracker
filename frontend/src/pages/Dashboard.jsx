import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { 
  Plus, 
  LogOut, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Calendar, 
  X, 
  User, 
  AlertCircle,
  BriefcaseBusiness,
  TrendingUp,
  Award,
  XOctagon,
  ArrowUpRight,
  Search,
  Download,
  List,
  LayoutGrid,
  MapPin,
  Clock,
  DollarSign,
  History,
  Tag
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  
  // Dashboard view settings
  const [viewMode, setViewMode] = useState('board'); // 'board' (Kanban) or 'list' (Table)
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ Applied: 0, Interview: 0, Offer: 0, Rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering, Searching, Sorting
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOption, setSortOption] = useState('appliedDate_desc');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedApp, setSelectedApp] = useState(null);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: 'Applied',
    appliedDate: '',
    jobLink: '',
    notes: '',
    salary: '',
    currency: 'USD',
    location: 'Remote',
    jobType: 'Full-time'
  });
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Debounce search query to prevent excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load applications and statistics
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [appsData, statsData] = await Promise.all([
        api.applications.getAll(activeFilter, debouncedSearch, sortOption),
        api.applications.getStats()
      ]);
      setApplications(appsData);
      setStats(statsData);
    } catch (err) {
      setError(err.message || 'Failed to retrieve dashboard details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeFilter, debouncedSearch, sortOption]);

  // Handle direct status change from Kanban Board Card dropdown
  const handleQuickStatusChange = async (appId, newStatus) => {
    try {
      await api.applications.update(appId, { status: newStatus });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update application status.');
    }
  };

  // Open modal for Adding
  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedApp(null);
    setFormData({
      company: '',
      role: '',
      status: 'Applied',
      appliedDate: new Date().toISOString().substring(0, 10), // default to today
      jobLink: '',
      notes: '',
      salary: '',
      currency: 'USD',
      location: 'Remote',
      jobType: 'Full-time'
    });
    setModalError('');
    setShowModal(true);
  };

  // Open modal for Editing
  const handleOpenEdit = (app) => {
    setModalMode('edit');
    setSelectedApp(app);
    
    let formattedDate = '';
    if (app.appliedDate) {
      formattedDate = new Date(app.appliedDate).toISOString().substring(0, 10);
    }

    setFormData({
      company: app.company,
      role: app.role,
      status: app.status,
      appliedDate: formattedDate,
      jobLink: app.jobLink || '',
      notes: app.notes || '',
      salary: app.salary !== null && app.salary !== undefined ? app.salary.toString() : '',
      currency: app.currency || 'USD',
      location: app.location || 'Remote',
      jobType: app.jobType || 'Full-time'
    });
    setModalError('');
    setShowModal(true);
  };

  // Handle Delete Application
  const handleDelete = async (id, company, role) => {
    if (window.confirm(`Are you sure you want to delete your application for ${role} at ${company}?`)) {
      try {
        await api.applications.delete(id);
        fetchData();
      } catch (err) {
        alert(err.message || 'Failed to delete application');
      }
    }
  };

  // Submit Add or Edit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    if (!formData.company.trim() || !formData.role.trim()) {
      setModalError('Company and Role fields are required.');
      setSubmitting(false);
      return;
    }

    const payload = {
      ...formData,
      salary: formData.salary.trim() ? Number(formData.salary) : null
    };

    try {
      if (modalMode === 'add') {
        await api.applications.create(payload);
      } else {
        await api.applications.update(selectedApp._id, payload);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setModalError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  // Export applications to CSV file
  const handleExportCSV = () => {
    if (applications.length === 0) {
      alert("No data available to export.");
      return;
    }

    const headers = ['Company', 'Role', 'Status', 'Applied Date', 'Job Link', 'Salary', 'Currency', 'Location', 'Job Type', 'Notes'];
    const rows = applications.map(app => [
      `"${app.company.replace(/"/g, '""')}"`,
      `"${app.role.replace(/"/g, '""')}"`,
      app.status,
      app.appliedDate ? new Date(app.appliedDate).toISOString().split('T')[0] : '',
      app.jobLink || '',
      app.salary !== null && app.salary !== undefined ? app.salary : '',
      app.currency || 'USD',
      app.location || 'Remote',
      app.jobType || 'Full-time',
      `"${(app.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `careerflow_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Format currency helper
  const formatSalary = (salary, currency) => {
    if (salary === null || salary === undefined || salary === '') return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      maximumFractionDigits: 0
    }).format(salary);
  };

  // Group applications by status for Kanban Board
  const getApplicationsByStatus = (status) => {
    return applications.filter(app => app.status === status);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '30px 5%' }} className="animate-fade">
      {/* Header Panel */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        marginBottom: '35px',
        borderRadius: '14px',
        background: 'rgba(17, 24, 39, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BriefcaseBusiness size={16} color="#fff" />
          </div>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            fontSize: '1.2rem',
            letterSpacing: '-0.02em',
            color: '#fff'
          }}>
            CAREERFLOW
          </span>
          <span style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            color: 'var(--color-accent-light)',
            fontSize: '0.75rem',
            padding: '2px 8px',
            borderRadius: '12px',
            marginLeft: '8px',
            fontWeight: 600
          }}>
            PRO
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.05)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-color)'
            }}>
              <User size={14} />
            </div>
            <span style={{ fontWeight: 500 }}>{user?.email}</span>
          </div>

          <button onClick={logout} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
            <LogOut size={14} />
            <span>LOG OUT</span>
          </button>
        </div>
      </header>

      {/* Stats Summary Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '40px'
      }}>
        {/* Applied Card */}
        <div className="glass-panel" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.5) 0%, rgba(59, 130, 246, 0.04) 100%)'
        }}>
          <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applied</span>
            <div style={{ color: 'var(--status-applied)', background: 'var(--status-applied-bg)', padding: '6px', borderRadius: '8px' }}>
              <BriefcaseBusiness size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800 }}>{stats.Applied}</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Applications Submitted</div>
        </div>

        {/* Interview Card */}
        <div className="glass-panel" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.5) 0%, rgba(139, 92, 246, 0.04) 100%)'
        }}>
          <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Interviews</span>
            <div style={{ color: 'var(--status-interview)', background: 'var(--status-interview-bg)', padding: '6px', borderRadius: '8px' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800 }}>{stats.Interview}</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Discussions Scheduled</div>
        </div>

        {/* Offer Card */}
        <div className="glass-panel" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.5) 0%, rgba(16, 185, 129, 0.04) 100%)'
        }}>
          <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offers</span>
            <div style={{ color: 'var(--status-offer)', background: 'var(--status-offer-bg)', padding: '6px', borderRadius: '8px' }}>
              <Award size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800 }}>{stats.Offer}</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Offers Handed Over</div>
        </div>

        {/* Rejected Card */}
        <div className="glass-panel" style={{
          padding: '24px',
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.5) 0%, rgba(239, 68, 68, 0.04) 100%)'
        }}>
          <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'flex-start', marginBottom: '14px', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rejected</span>
            <div style={{ color: 'var(--status-rejected)', background: 'var(--status-rejected-bg)', padding: '6px', borderRadius: '8px' }}>
              <XOctagon size={18} />
            </div>
          </div>
          <h2 style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 800 }}>{stats.Rejected}</h2>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Rejections Logged</div>
        </div>
      </section>

      {/* Control Toolbar */}
      <section className="glass-panel" style={{
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '30px',
        background: 'rgba(17, 24, 39, 0.2)'
      }}>
        {/* Row 1: Search, Sort, View toggle, Export */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          {/* Search bar */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '400px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '44px', paddingRight: '16px', margin: 0 }}
              placeholder="Search by company or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sorters, View Toggles & Export */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Sort Dropdown */}
            <select
              className="form-input"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              style={{
                width: '180px',
                margin: 0,
                paddingRight: '36px',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239CA3AF\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                backgroundSize: '14px'
              }}
            >
              <option value="appliedDate_desc">Date: Newest First</option>
              <option value="appliedDate_asc">Date: Oldest First</option>
              <option value="company_asc">Company: A - Z</option>
              <option value="company_desc">Company: Z - A</option>
              <option value="salary_desc">Salary: High to Low</option>
              <option value="salary_asc">Salary: Low to High</option>
            </select>

            {/* View Mode Toggle */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-color)',
              padding: '2px',
              borderRadius: '10px',
              display: 'flex'
            }}>
              <button
                onClick={() => setViewMode('board')}
                style={{
                  background: viewMode === 'board' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'board' ? '#fff' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                <LayoutGrid size={14} />
                <span>BOARD</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  background: viewMode === 'list' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  border: 'none',
                  color: viewMode === 'list' ? '#fff' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8rem'
                }}
              >
                <List size={14} />
                <span>LIST</span>
              </button>
            </div>

            {/* Export CSV button */}
            <button onClick={handleExportCSV} className="btn btn-secondary" style={{ padding: '10px 14px' }} title="Export to CSV">
              <Download size={16} />
              <span className="export-text">EXPORT</span>
            </button>

            {/* Add Job application button */}
            <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '10px 16px' }}>
              <Plus size={16} />
              <span>ADD APPLICATION</span>
            </button>
          </div>
        </div>

        {/* Row 2: Status filters (only active or useful in List View since Kanban shows all columns at once!) */}
        {viewMode === 'list' && (
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '2px',
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            paddingTop: '12px'
          }}>
            {['All', 'Applied', 'Interview', 'Offer', 'Rejected'].map(filterOption => (
              <button
                key={filterOption}
                onClick={() => setActiveFilter(filterOption)}
                style={{
                  background: activeFilter === filterOption ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                  border: 'none',
                  color: activeFilter === filterOption ? '#fff' : 'var(--text-secondary)',
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontFamily: "'Outfit', sans-serif",
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {filterOption.toUpperCase()} ({filterOption === 'All' ? applications.length : stats[filterOption] || 0})
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Error alert */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          color: '#F87171',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div className="glass-panel" style={{ padding: '80px 0', textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            margin: '0 auto 16px',
            borderRadius: '50%',
            border: '3px solid rgba(124, 58, 237, 0.1)',
            borderTopColor: '#7C3AED',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fetching pipeline data...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : applications.length === 0 ? (
        <div className="glass-panel" style={{ padding: '80px 20px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border-color)',
            margin: '0 auto 20px'
          }}>
            <BriefcaseBusiness size={24} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '8px' }}>No applications tracked</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '24px' }}>
            {searchQuery 
              ? `No job applications matched your search for "${searchQuery}".` 
              : "Start organizing your recruitment pipeline today. Track your first job application!"}
          </p>
          {!searchQuery && (
            <button onClick={handleOpenAdd} className="btn btn-secondary" style={{ padding: '8px 16px' }}>
              Create First Entry
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* =====================================================================
           LIST VIEW (TABLE)
           ===================================================================== */
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto', background: 'rgba(17, 24, 39, 0.15)' }}>
          <table className="app-table">
            <thead>
              <tr>
                <th style={{ width: '22%' }}>Company</th>
                <th style={{ width: '22%' }}>Role & Specs</th>
                <th style={{ width: '15%' }}>Applied Date</th>
                <th style={{ width: '14%' }}>Salary</th>
                <th style={{ width: '12%' }}>Status</th>
                <th style={{ width: '7%', textAlign: 'center' }}>Link</th>
                <th style={{ width: '8%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id} className="table-row">
                  <td style={{ fontWeight: 700, color: '#fff' }}>{app.company}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{app.role}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span className="attr-badge"><MapPin size={10} style={{ marginRight: '3px' }} />{app.location}</span>
                        <span className="attr-badge"><Clock size={10} style={{ marginRight: '3px' }} />{app.jobType}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                      <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{formatDate(app.appliedDate)}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#fff' }}>
                    {app.salary ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <DollarSign size={14} style={{ color: 'var(--color-accent-light)' }} />
                        <span>{formatSalary(app.salary, app.currency)}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>&mdash;</span>
                    )}
                  </td>
                  <td>
                    {/* Inline Status Changer Selector */}
                    <select
                      value={app.status}
                      onChange={(e) => handleQuickStatusChange(app._id, e.target.value)}
                      className={`badge badge-${app.status.toLowerCase()}`}
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        cursor: 'pointer',
                        padding: '4px 24px 4px 12px',
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23ffffff\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                        backgroundSize: '10px'
                      }}
                    >
                      <option value="Applied" style={{ background: '#0F1422', color: '#60A5FA' }}>Applied</option>
                      <option value="Interview" style={{ background: '#0F1422', color: '#A78BFA' }}>Interview</option>
                      <option value="Offer" style={{ background: '#0F1422', color: '#34D399' }}>Offer</option>
                      <option value="Rejected" style={{ background: '#0F1422', color: '#F87171' }}>Rejected</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {app.jobLink ? (
                      <a 
                        href={app.jobLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--color-accent-light)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: 'rgba(6, 182, 212, 0.05)',
                          border: '1px solid rgba(6, 182, 212, 0.1)'
                        }}
                      >
                        <ArrowUpRight size={14} />
                      </a>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>&mdash;</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                      <button 
                        onClick={() => handleOpenEdit(app)} 
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid var(--border-color)',
                          color: 'var(--text-secondary)',
                          padding: '6px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Edit application"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(app._id, app.company, app.role)} 
                        style={{
                          background: 'rgba(239, 68, 68, 0.05)',
                          border: '1px solid rgba(239, 68, 68, 0.15)',
                          color: '#F87171',
                          padding: '6px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Delete application"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* =====================================================================
           BOARD VIEW (KANBAN)
           ===================================================================== */
        <div className="kanban-board">
          {['Applied', 'Interview', 'Offer', 'Rejected'].map(statusName => {
            const list = getApplicationsByStatus(statusName);
            return (
              <div key={statusName} className="kanban-col animate-slide">
                <div className="kanban-col-header">
                  <div className="kanban-title">
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: statusName === 'Applied' ? 'var(--status-applied)' :
                                  statusName === 'Interview' ? 'var(--status-interview)' :
                                  statusName === 'Offer' ? 'var(--status-offer)' :
                                  'var(--status-rejected)'
                    }} />
                    <span>{statusName}</span>
                  </div>
                  <span className="kanban-count">{list.length}</span>
                </div>

                <div className="kanban-cards-list">
                  {list.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 10px',
                      color: 'var(--text-muted)',
                      border: '1px dashed var(--border-color)',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      Drop cards here
                    </div>
                  ) : (
                    list.map(app => (
                      <div key={app._id} className="kanban-card">
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'flex-start', marginBottom: '4px' }}>
                            <h4 className="kanban-card-title">{app.role}</h4>
                            {app.jobLink && (
                              <a href={app.jobLink} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)' }}>
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </div>
                          <p className="kanban-card-company">{app.company}</p>
                        </div>

                        {/* Badges metadata */}
                        <div className="kanban-card-meta">
                          <span className="attr-badge"><MapPin size={9} style={{ marginRight: '2px' }} />{app.location}</span>
                          <span className="attr-badge"><Clock size={9} style={{ marginRight: '2px' }} />{app.jobType}</span>
                          {app.salary && (
                            <span className="attr-badge" style={{ color: '#fff', fontWeight: 600 }}>
                              <DollarSign size={9} style={{ color: 'var(--color-accent-light)' }} />
                              {formatSalary(app.salary, app.currency)}
                            </span>
                          )}
                        </div>

                        {app.notes && (
                          <p style={{
                            color: 'var(--text-muted)',
                            fontSize: '0.8rem',
                            borderLeft: '2px solid var(--border-color)',
                            paddingLeft: '8px',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap'
                          }} title={app.notes}>
                            {app.notes}
                          </p>
                        )}

                        <div className="kanban-card-footer">
                          {/* Mini quick select to change status */}
                          <select
                            value={app.status}
                            onChange={(e) => handleQuickStatusChange(app._id, e.target.value)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              paddingRight: '14px',
                              appearance: 'none',
                              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239CA3AF\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                              backgroundRepeat: 'no-repeat',
                              backgroundPosition: 'right 0 center',
                              backgroundSize: '10px'
                            }}
                          >
                            <option value="Applied" style={{ background: '#0F1422' }}>Move to: Applied</option>
                            <option value="Interview" style={{ background: '#0F1422' }}>Move to: Interview</option>
                            <option value="Offer" style={{ background: '#0F1422' }}>Move to: Offer</option>
                            <option value="Rejected" style={{ background: '#0F1422' }}>Move to: Rejected</option>
                          </select>

                          {/* Quick Action Buttons */}
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={() => handleOpenEdit(app)}
                              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                              <Edit2 size={12} />
                            </button>
                            <button 
                              onClick={() => handleDelete(app._id, app.company, app.role)}
                              style={{ background: 'transparent', border: 'none', color: '#F87171', cursor: 'pointer' }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal - Add / Edit Application */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(8, 11, 17, 0.8)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} className="animate-fade">
          <div className="glass-panel animate-scale" style={{
            background: 'var(--bg-modal)',
            width: '100%',
            maxWidth: '560px',
            borderRadius: '18px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              flexShrink: 0
            }}>
              <h3 style={{ color: '#fff', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BriefcaseBusiness size={18} style={{ color: 'var(--color-primary-light)' }} />
                {modalMode === 'add' ? 'Add Application' : 'Edit Application'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%'
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{ overflowY: 'auto', padding: '24px', flex: 1 }}>
              <form onSubmit={handleSubmit}>
                {modalError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '8px',
                    padding: '10px 14px',
                    color: '#F87171',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.85rem',
                    marginBottom: '16px'
                  }}>
                    <AlertCircle size={16} />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Company and Role */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="company">Company</label>
                    <input
                      id="company"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Stripe"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="role">Role</label>
                    <input
                      id="role"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Frontend Dev"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Status and Applied Date */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="status">Status</label>
                    <select
                      id="status"
                      className="form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      style={{
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239CA3AF\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interview">Interview</option>
                      <option value="Offer">Offer</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="appliedDate">Applied Date</label>
                    <input
                      id="appliedDate"
                      type="date"
                      className="form-input"
                      value={formData.appliedDate}
                      onChange={(e) => setFormData({ ...formData, appliedDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Location and Job Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="location">Location Type</label>
                    <select
                      id="location"
                      className="form-input"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      style={{
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239CA3AF\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="jobType">Work Type</label>
                    <select
                      id="jobType"
                      className="form-input"
                      value={formData.jobType}
                      onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                      style={{
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239CA3AF\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </select>
                  </div>
                </div>

                {/* Salary & Currency */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                  <div className="input-group">
                    <label className="input-label" htmlFor="salary">Salary (Annual / Rate)</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="salary"
                        type="number"
                        className="form-input"
                        placeholder="e.g. 120000"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="input-group">
                    <label className="input-label" htmlFor="currency">Currency</label>
                    <select
                      id="currency"
                      className="form-input"
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      style={{
                        appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%239CA3AF\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 16px center',
                        backgroundSize: '16px'
                      }}
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                    </select>
                  </div>
                </div>

                {/* Job Link */}
                <div className="input-group">
                  <label className="input-label" htmlFor="jobLink">Job Post Link</label>
                  <input
                    id="jobLink"
                    type="url"
                    className="form-input"
                    placeholder="https://company.com/careers/job-id"
                    value={formData.jobLink}
                    onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                  />
                </div>

                {/* Notes */}
                <div className="input-group" style={{ marginBottom: '24px' }}>
                  <label className="input-label" htmlFor="notes">Notes</label>
                  <textarea
                    id="notes"
                    className="form-input"
                    placeholder="Recruiter contacts, interview rounds, prep instructions..."
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ resize: 'vertical', minHeight: '70px' }}
                  />
                </div>

                {/* STATUS HISTORY TIMELINE (Edit Mode Only) */}
                {modalMode === 'edit' && selectedApp && selectedApp.history && selectedApp.history.length > 0 && (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    padding: '16px',
                    marginBottom: '20px'
                  }}>
                    <h5 style={{
                      color: '#fff',
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      marginBottom: '12px'
                    }}>
                      <History size={14} style={{ color: 'var(--color-accent-light)' }} />
                      STATUS LIFECYCLE TIMELINE
                    </h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '8px' }}>
                      {selectedApp.history.map((hist, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          position: 'relative'
                        }}>
                          {/* Dot line indicator */}
                          {idx < selectedApp.history.length - 1 && (
                            <div style={{
                              position: 'absolute',
                              left: '6px',
                              top: '12px',
                              width: '1px',
                              height: '20px',
                              background: 'rgba(255, 255, 255, 0.1)'
                            }} />
                          )}
                          
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: hist.status === 'Applied' ? 'var(--status-applied)' :
                                        hist.status === 'Interview' ? 'var(--status-interview)' :
                                        hist.status === 'Offer' ? 'var(--status-offer)' :
                                        'var(--status-rejected)'
                          }} />
                          
                          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', width: '70px' }}>
                            {hist.status}
                          </span>
                          
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {formatDate(hist.updatedAt)} at {new Date(hist.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Modal Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '20px'
                }}>
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)} 
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : 'Save Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media (max-width: 768px) {
          .export-text { display: none; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
