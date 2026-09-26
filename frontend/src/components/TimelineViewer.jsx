import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, Clock } from 'lucide-react';

export default function TimelineViewer({ sessionId }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchTimeline() {
      try {
        const res = await axios.post('http://localhost:8000/api/extract-timeline', { session_id: sessionId });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTimeline();
  }, [sessionId]);

  if (loading) return <div className="p-12 text-center text-slate-500 dark:text-slate-400">Extracting timeline...</div>;
  if (!data || !data.events?.length) return <div className="p-12 text-center text-slate-500 dark:text-slate-400">No date-bound obligations found.</div>;

  const downloadIcs = () => {
    const blob = new Blob([data.ics_content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'obligations.ics';
    a.click();
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-8">
        <h3 className="text-2xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Calendar className="text-indigo-600 dark:text-indigo-400" /> Date-Bound Obligations
        </h3>
        <button 
          onClick={downloadIcs}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium transition-colors w-full sm:w-auto justify-center"
        >
          <Download className="w-4 h-4" /> Export to Calendar (.ics)
        </button>
      </div>

      <div className="relative border-l-2 border-indigo-200 dark:border-indigo-800 ml-4 space-y-8 pb-8">
        {data.events.map((event, idx) => (
          <div key={idx} className="relative pl-8">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-[#0a0a0a] border-2 border-indigo-600 dark:border-indigo-400"></div>
            <div className="bg-white dark:bg-[#0a0a0a] p-5 rounded-xl border border-slate-100 dark:border-neutral-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                <Clock className="w-4 h-4" />
                {event.date_description}
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">{event.event_name}</h4>
              <p className="text-slate-600 dark:text-slate-400">{event.obligation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
