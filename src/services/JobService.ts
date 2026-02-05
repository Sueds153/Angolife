import { supabase } from '../lib/supabase';
import { JobListing } from '../types';

export const JobService = {
  // Fetch jobs from Supabase with pagination
  fetchJobs: async (page = 1, limit = 10): Promise<JobListing[]> => {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'published') // Somente vagas aprovadas pelo Admin
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map(job => JobService.mapJob(job));
  },

  // Fetch only the latest jobs for Home page
  getLatestJobs: async (limit = 3): Promise<JobListing[]> => {
    return await JobService.fetchJobs(1, limit);
  },

  // Get single job by ID
  getJobById: async (id: string): Promise<JobListing | null> => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }
    
    return JobService.mapJob(data);
  },

  // Busca vagas pendentes de moderação
  fetchPendingJobs: async (): Promise<JobListing[]> => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) return [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map(job => JobService.mapJob(job));
  },

  // Adicionar nova vaga manualmente
  addJob: async (job: Omit<JobListing, 'id' | 'postedAt' | 'status'>, status: 'pending' | 'published' = 'published') => {
    return await supabase
      .from('jobs')
      .insert([{
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        source: job.source || 'Manual',
        external_link: job.sourceUrl,
        description: job.description,
        is_elite: job.isElite,
        salary: job.salary,
        salary_value: job.salaryValue,
        email: job.email,
        phone: job.phone,
        status: status,
        created_at: new Date().toISOString()
      }]);
  },

  // Aprovar uma vaga
  approveJob: async (id: string) => {
    return await supabase
      .from('jobs')
      .update({ status: 'published' })
      .eq('id', id);
  },

  // Deletar uma vaga
  deleteJob: async (id: string) => {
    return await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mapJob: (job: any): JobListing => ({
    id: job?.id || '',
    title: job?.title || 'Sem Título',
    company: job?.company || 'Empresa Privada',
    location: job?.location || 'Angola',
    type: job?.type || 'Tempo Inteiro',
    postedAt: job?.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recentemente',
    salary: job?.salary,
    salaryValue: job?.salary_value,
    isElite: job?.is_elite,
    image: job?.image,
    description: job?.description,
    email: job?.email,
    phone: job?.phone,
    source: job?.source,
    sourceUrl: job?.external_link,
    status: job?.status
  })
};
