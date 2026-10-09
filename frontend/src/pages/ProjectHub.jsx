import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  GitBranch,
  Search,
  Plus,
  Github,
  Users,
  Sparkles,
  Send,
  CheckCircle2,
  AlertCircle,
  Code2,
  Tag
} from 'lucide-react';

export const ProjectHub = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Capstone Project');
  const [department, setDepartment] = useState('CSE');
  const [requiredSkills, setRequiredSkills] = useState('Python, React, AI/ML');
  const [teamSize, setTeamSize] = useState(4);
  const [githubUrl, setGithubUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const skillFilters = ['All', 'Python', 'React', 'AI/ML', 'IoT', 'Java', 'Cloud', 'Cybersecurity', 'OpenCV'];

  useEffect(() => {
    fetchProjects();
  }, [selectedSkill]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedSkill && selectedSkill !== 'All') params.skill = selectedSkill;
      const res = await api.get('/projects', { params });
      if (res.data?.success) setProjects(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const res = await api.post('/projects', {
        title,
        description,
        category,
        department,
        required_skills: requiredSkills.split(',').map(s => s.trim()),
        team_size: Number(teamSize),
        github_url: githubUrl
      });

      if (res.data?.success) {
        setActionMsg('Project published to collaboration board!');
        setShowCreateModal(false);
        setTitle('');
        setDescription('');
        setGithubUrl('');
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyToProject = async (projectId) => {
    try {
      const res = await api.post(`/projects/${projectId}/apply`);
      if (res.data?.success) {
        setActionMsg('Team collaboration request submitted to project lead!');
        setTimeout(() => setActionMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting application');
    }
  };

  const filteredProjects = projects.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <GitBranch className="w-6 h-6 text-cyan-500" />
            Project & Hackathon Collaboration Hub
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Pitch capstone ideas, recruit teammates by tech stack, and share open-source repositories
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Pitch New Project</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by topic, framework, or keywords..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Skill tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Skills:</span>
          {skillFilters.map((sk) => (
            <button
              key={sk}
              onClick={() => setSelectedSkill(sk === 'All' ? '' : sk)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                (selectedSkill === sk || (!selectedSkill && sk === 'All'))
                  ? 'bg-cyan-500 text-white shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-100 dark:bg-navy-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {sk}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProjects.map((p) => (
          <div key={p._id} className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase font-mono">
                  {p.category}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded-full bg-emerald-500/10">
                  {p.status || 'Recruiting'}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">{p.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed line-clamp-3">
                {p.description}
              </p>

              {/* Skills required */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.required_skills?.map((sk, idx) => (
                  <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 text-slate-700 dark:text-slate-300">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200">
                  <Users className="w-3.5 h-3.5 text-cyan-500" />
                  {p.current_members || 1} / {p.team_size || 4} Members
                </span>
                {p.github_url && (
                  <a href={p.github_url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    <Github className="w-4 h-4" />
                  </a>
                )}
              </div>

              <button
                onClick={() => handleApplyToProject(p._id)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-cyan-500 hover:text-white text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                <span>Join Team</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Pitch Engineering Project / Hackathon Idea</h3>
            
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Autonomous Quadcopter with Thermal Obstacle Avoidance"
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Capstone Project">Capstone Project</option>
                    <option value="Mini Project">Mini Project</option>
                    <option value="Research / Hackathon">Research / Hackathon</option>
                    <option value="Open Source Tool">Open Source Tool</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Target Team Size</label>
                  <input
                    type="number"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    min="2"
                    max="6"
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  value={requiredSkills}
                  onChange={(e) => setRequiredSkills(e.target.value)}
                  placeholder="Python, ROS2, OpenCV, PyTorch, Embedded C"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Project Abstract</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Outline the problem statement, engineering architecture, and expected deliverables..."
                  required
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Repository Link (Optional)</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/organization/repo"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-navy-800 rounded-xl focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  {submitting ? 'Publishing...' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
