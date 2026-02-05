import React, { useState, useEffect } from 'react';
import { NewsService } from '../services/NewsService';
import { NewsItem } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminNews: React.FC = () => {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    image_url: '',
    status: 'published' as 'draft' | 'published',
    category: 'Economia'
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    const data = await NewsService.getNews();
    setItems(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) return;

    setSubmitting(true);
    const newItem = await NewsService.addNews({
      title: formData.title,
      description: formData.description,
      content: formData.content,
      image_url: formData.image_url,
      status: formData.status,
      category: formData.category
    });

    if (newItem) {
      setFormData({ 
        title: '', 
        description: '', 
        content: '', 
        image_url: '', 
        status: 'published', 
        category: 'Economia' 
      });
      loadItems();
      addToast('Notícia adicionada com sucesso! 🚀', 'success');
    } else {
      addToast('Erro ao adicionar notícia. Tente novamente.', 'error');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja apagar esta notícia?')) {
      const success = await NewsService.deleteNews(id);
      if (success) loadItems();
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 dark:bg-background-dark border border-gold-primary/20 p-8 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gold-primary/10 rounded-full blur-3xl"></div>
        <h1 className="text-3xl font-black text-white mb-2 relative z-10">Painel Administrativo</h1>
        <p className="text-gold-primary text-sm font-bold uppercase tracking-widest relative z-10">Gerenciamento de Notícias & Reels</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl sticky top-28">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-gold-primary">add_circle</span> Nova Notícia
            </h3>
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Título da Notícia</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-primary transition-colors text-gray-900 dark:text-white"
                  placeholder="Ex: Novo Investimento em Luanda..."
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Descrição</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-primary transition-colors text-gray-900 dark:text-white h-24 resize-none"
                  placeholder="Resumo curto para o card..."
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">URL da Imagem (Vertical 9:16)</label>
                <input 
                  type="url" 
                  value={formData.image_url}
                  onChange={e => setFormData({...formData, image_url: e.target.value})}
                  className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-primary transition-colors text-gray-900 dark:text-white"
                  placeholder="https://..."
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">Recomendado: Imagens verticais para melhor visualização.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Conteúdo Completo (Notícia Completa)</label>
                <textarea 
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-primary transition-colors text-gray-900 dark:text-white h-48"
                  placeholder="Escreva aqui a notícia completa..."
                  required
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Categoria</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-primary transition-colors text-gray-900 dark:text-white"
                  >
                    <option value="Economia">Economia</option>
                    <option value="Negócios">Negócios</option>
                    <option value="Mercado">Mercado</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as 'draft' | 'published'})}
                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-primary transition-colors text-gray-900 dark:text-white"
                  >
                    <option value="published">Publicar Agora</option>
                    <option value="draft">Salvar Rascunho</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="mt-4 w-full bg-gold-gradient text-background-dark font-black uppercase tracking-widest py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold-primary/20"
              >
                {submitting ? 'A processar...' : formData.status === 'published' ? '🚀 Publicar para Todos' : '💾 Salvar para Depois'}
              </button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-gold-primary">dashboard</span> Notícias Ativas
            </h3>
            <span className="bg-gold-primary/10 text-gold-primary px-3 py-1 rounded-full text-xs font-black">{items.length} ITENS</span>
          </div>

          {loading ? (
             <div className="text-center py-10 text-gray-500">Carregando painel...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-white/10">
              <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">inbox</span>
              <p className="text-gray-500">Nenhuma notícia publicada ainda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 p-4 glass-card rounded-2xl group border border-transparent hover:border-gold-primary/30 transition-all bg-white dark:bg-white/5">
                  <div 
                    className="w-20 h-24 rounded-lg bg-cover bg-center shrink-0"
                    style={{ backgroundImage: `url('${item.image_url}')` }}
                  ></div>
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white truncate" title={item.title}>{item.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-[10px] text-gray-400">{new Date(item.created_at || '').toLocaleDateString()}</span>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span> Apagar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
