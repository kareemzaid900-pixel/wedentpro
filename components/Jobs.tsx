
import React from 'react';
import { MOCK_JOBS } from '../constants';
import { MapPin, Clock, DollarSign, Upload } from 'lucide-react';

const Jobs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Careers</h2>
          <p className="text-slate-500">Find your next opportunity or hire talent.</p>
        </div>
        <button className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
          <Upload size={18} /> Upload CV
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_JOBS.map(job => (
          <div key={job.id} className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm hover:border-teal-200 transition-colors flex flex-col md:flex-row justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800">{job.title}</h3>
              <p className="text-teal-600 font-medium mb-3">{job.clinic}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                <span className="flex items-center gap-1"><MapPin size={16} /> {job.location}</span>
                <span className="flex items-center gap-1"><Clock size={16} /> {job.type}</span>
                <span className="flex items-center gap-1"><DollarSign size={16} /> {job.salaryRange}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                {job.requirements.map((req, i) => (
                  <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">{req}</span>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center items-end gap-2 w-full md:w-auto">
              <span className="text-xs text-slate-400 self-start md:self-end">{job.postedDate}</span>
              <button className="w-full md:w-auto px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
