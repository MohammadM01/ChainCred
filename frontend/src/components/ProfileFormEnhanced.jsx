import React, { useState } from 'react';
import api from '../utils/api';
import { useUser } from '../context/UserContext';

const ProfileFormEnhanced = ({ wallet, onSave }) => {
  const { showToast } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedin: '',
    github: '',
    phone: '',
    location: '',
    bio: '',
    education: [{ degree: '', institution: '', year: '', gpa: '' }],
    workExperience: [{ role: '', company: '', duration: '', description: '' }],
    skills: [''],
    languages: [''],
    projects: [{ name: '', description: '', technologies: '', link: '' }]
  });
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index, field, value, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (arrayName, template) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], template]
    }));
  };

  const removeArrayItem = (index, arrayName) => {
    setFormData(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleSkillsChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.map((skill, i) => i === index ? value : skill)
    }));
  };

  const addSkill = () => {
    setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const removeSkill = (index) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const cleanData = {
        ...formData,
        education: formData.education.filter(edu => edu.degree && edu.institution),
        workExperience: formData.workExperience.filter(work => work.role && work.company),
        skills: formData.skills.filter(skill => skill.trim()),
        languages: formData.languages.filter(lang => lang.trim()),
        projects: formData.projects.filter(proj => proj.name)
      };

      await api.post('/api/resume/save-profile', { wallet, ...cleanData });
      showToast('success', 'Profile saved successfully! 🎉');
      onSave();
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '👤' },
    { id: 'education', label: 'Education', icon: '🎓' },
    { id: 'experience', label: 'Experience', icon: '💼' },
    { id: 'skills', label: 'Skills', icon: '⚡' },
    { id: 'projects', label: 'Projects', icon: '🚀' }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Section Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              activeSection === section.id
                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black shadow-lg'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {section.icon} {section.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        {activeSection === 'basic' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-2xl font-bold text-yellow-400 mb-6 flex items-center gap-3">
              👤 Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name *</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, Country"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn</label>
                <input
                  name="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">GitHub</label>
                <input
                  name="github"
                  type="url"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                <textarea
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about yourself, your passion, and what drives you..."
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Education */}
        {activeSection === 'education' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-yellow-400 flex items-center gap-3">
                🎓 Education
              </h3>
              <button
                type="button"
                onClick={() => addArrayItem('education', { degree: '', institution: '', year: '', gpa: '' })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Add Education
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.education.map((edu, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-200">Education #{index + 1}</h4>
                    {formData.education.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'education')}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Degree *</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleArrayChange(index, 'degree', e.target.value, 'education')}
                        placeholder="e.g., Bachelor of Science in Computer Science"
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Institution *</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => handleArrayChange(index, 'institution', e.target.value, 'education')}
                        placeholder="e.g., University of Technology"
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => handleArrayChange(index, 'year', e.target.value, 'education')}
                        placeholder="e.g., 2020-2024"
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">GPA</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => handleArrayChange(index, 'gpa', e.target.value, 'education')}
                        placeholder="e.g., 3.8/4.0"
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Work Experience */}
        {activeSection === 'experience' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-yellow-400 flex items-center gap-3">
                💼 Work Experience
              </h3>
              <button
                type="button"
                onClick={() => addArrayItem('workExperience', { role: '', company: '', duration: '', description: '' })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Add Experience
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.workExperience.map((work, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-200">Experience #{index + 1}</h4>
                    {formData.workExperience.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'workExperience')}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Role *</label>
                      <input
                        type="text"
                        value={work.role}
                        onChange={(e) => handleArrayChange(index, 'role', e.target.value, 'workExperience')}
                        placeholder="e.g., Software Engineer"
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Company *</label>
                      <input
                        type="text"
                        value={work.company}
                        onChange={(e) => handleArrayChange(index, 'company', e.target.value, 'workExperience')}
                        placeholder="e.g., Tech Corp"
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                      <input
                        type="text"
                        value={work.duration}
                        onChange={(e) => handleArrayChange(index, 'duration', e.target.value, 'workExperience')}
                        placeholder="e.g., Jan 2023 - Present"
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      rows="3"
                      value={work.description}
                      onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'workExperience')}
                      placeholder="Describe your responsibilities and achievements..."
                      className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {activeSection === 'skills' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-yellow-400 flex items-center gap-3">
                ⚡ Skills & Languages
              </h3>
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Add Skill
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-200 mb-4">Technical Skills</h4>
                <div className="space-y-3">
                  {formData.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleSkillsChange(index, e.target.value)}
                        placeholder="e.g., JavaScript, React, Node.js"
                        className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                      {formData.skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSkill(index)}
                          className="text-red-400 hover:text-red-300 text-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-200 mb-4">Languages</h4>
                <div className="space-y-3">
                  {formData.languages.map((lang, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="text"
                        value={lang}
                        onChange={(e) => handleArrayChange(index, 'languages', e.target.value, 'languages')}
                        placeholder="e.g., English (Native), Spanish (Intermediate)"
                        className="flex-1 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                      {formData.languages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, 'languages')}
                          className="text-red-400 hover:text-red-300 text-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('languages', '')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    + Add Language
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects */}
        {activeSection === 'projects' && (
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-yellow-400 flex items-center gap-3">
                🚀 Projects
              </h3>
              <button
                type="button"
                onClick={() => addArrayItem('projects', { name: '', description: '', technologies: '', link: '' })}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                + Add Project
              </button>
            </div>
            
            <div className="space-y-6">
              {formData.projects.map((project, index) => (
                <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-200">Project #{index + 1}</h4>
                    {formData.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem(index, 'projects')}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Project Name *</label>
                      <input
                        type="text"
                        value={project.name}
                        onChange={(e) => handleArrayChange(index, 'name', e.target.value, 'projects')}
                        placeholder="e.g., E-commerce Platform"
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Technologies</label>
                      <input
                        type="text"
                        value={project.technologies}
                        onChange={(e) => handleArrayChange(index, 'technologies', e.target.value, 'projects')}
                        placeholder="e.g., React, Node.js, MongoDB"
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Project Link</label>
                      <input
                        type="url"
                        value={project.link}
                        onChange={(e) => handleArrayChange(index, 'link', e.target.value, 'projects')}
                        placeholder="https://github.com/username/project"
                        className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      rows="3"
                      value={project.description}
                      onChange={(e) => handleArrayChange(index, 'description', e.target.value, 'projects')}
                      placeholder="Describe what the project does, your role, and key achievements..."
                      className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center pt-8">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                Saving Profile...
              </div>
            ) : (
              '💾 Save Profile & Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileFormEnhanced;
