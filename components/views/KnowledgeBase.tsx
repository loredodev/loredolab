
import React, { useState, useEffect } from 'react';
import { BookResource, Language, Achievement, BookCategory, User } from '../../types';
import { CheckCircle, Circle, BookOpen, Search, Plus, Trophy, TrendingUp, X, Bookmark, Image as ImageIcon, ShoppingBag, ExternalLink, Loader2 } from 'lucide-react';
import { CONTENT } from '../../constants';
import { getUserLibrary, syncBookStatus } from '../../services/tracking';

interface KnowledgeBaseProps {
  lang: Language;
  user: User;
}

// Helper to get official cover from Open Library via ISBN
const getCover = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
// Helper to generate Amazon Search Link
const getBuyLink = (title: string, author: string) => `https://www.amazon.com/s?k=${encodeURIComponent(title + " " + author)}`;

// --- MASSIVE DATA SEED (100+ BOOKS) ---
const getBooks = (lang: Language): BookResource[] => {
  const isPt = lang === 'pt';
  
  // Data Structure: ID, TitlePT, TitleEN, Author, Category, ISBN (for cover)
  const rawData: Array<[string, string, string, string, BookCategory, string]> = [
    // FOCUS & PRODUCTIVITY
    ["1", "Trabalho Focado", "Deep Work", "Cal Newport", "Focus", "9781455586691"],
    ["2", "Hiperfoco", "Hyperfocus", "Chris Bailey", "Focus", "9780525522232"],
    ["3", "Flow", "Flow", "Mihaly Csikszentmihalyi", "Focus", "9780061339202"],
    ["4", "Essencialismo", "Essentialism", "Greg McKeown", "Focus", "9780804137386"],
    ["5", "A Única Coisa", "The One Thing", "Gary Keller", "Focus", "9781885167774"],
    ["6", "Indistraível", "Indistractable", "Nir Eyal", "Focus", "9781948836531"],
    ["7", "Foco Roubado", "Stolen Focus", "Johann Hari", "Focus", "9780593138519"],
    ["8", "A Arte de Fazer Acontecer", "Getting Things Done", "David Allen", "Focus", "9780142000281"],
    ["9", "Minimalismo Digital", "Digital Minimalism", "Cal Newport", "Focus", "9780525536512"],
    ["10", "Sem Esforço", "Effortless", "Greg McKeown", "Focus", "9780593135648"],
    ["11", "Produtividade Para Quem Quer Tempo", "Free to Focus", "Michael Hyatt", "Focus", "9780801075261"],
    ["12", "Organize Sua Mente", "Organize Your Mind, Organize Your Life", "Dr. Paul Hammerness", "Focus", "9780373892563"],
    
    // HABITS
    ["13", "Hábitos Atômicos", "Atomic Habits", "James Clear", "Habits", "9780735211292"],
    ["14", "O Poder do Hábito", "The Power of Habit", "Charles Duhigg", "Habits", "9780812981605"],
    ["15", "Micro-Hábitos", "Tiny Habits", "BJ Fogg", "Habits", "9780358003328"],
    ["16", "O Clube das 5 da Manhã", "The 5AM Club", "Robin Sharma", "Habits", "9781443456623"],
    ["17", "Garrra", "Grit", "Angela Duckworth", "Habits", "9781501111105"],
    ["18", "Mindset", "Mindset", "Carol S. Dweck", "Habits", "9780345472328"],
    ["19", "Os 7 Hábitos das Pessoas Altamente Eficazes", "The 7 Habits of Highly Effective People", "Stephen R. Covey", "Habits", "9780743269513"],
    ["20", "Disciplina é Liberdade", "Discipline Equals Freedom", "Jocko Willink", "Habits", "9781250156945"],
    ["21", "Mude Seus Horários, Mude Sua Vida", "Change Your Schedule, Change Your Life", "Dr. Suhas Kshirsagar", "Habits", "9780062684868"],
    ["22", "High Performance Habits", "High Performance Habits", "Brendon Burchard", "Habits", "9781401952853"],
    
    // SLEEP & HEALTH
    ["23", "Por Que Nós Dormimos", "Why We Sleep", "Matthew Walker", "Sleep", "9781501144318"],
    ["24", "Dormir Inteligente", "Sleep Smarter", "Shawn Stevenson", "Sleep", "9781623367398"],
    ["25", "A Revolução do Sono", "The Sleep Revolution", "Arianna Huffington", "Sleep", "9781101904008"],
    ["26", "Breath", "Breath", "James Nestor", "Health", "9780735213616"],
    ["27", "Outlive", "Outlive", "Peter Attia", "Health", "9780593236598"],
    ["28", "O Corpo de 4 Horas", "The 4-Hour Body", "Tim Ferriss", "Health", "9780307463630"],
    ["29", "A Dieta do Cérebro", "Grain Brain", "David Perlmutter", "Health", "9780316234801"],
    ["30", "O Código da Obesidade", "The Obesity Code", "Jason Fung", "Health", "9781771641258"],
    ["31", "Como Não Morrer", "How Not To Die", "Michael Greger", "Health", "9781250066114"],
    ["32", "Tempo de Viver", "Lifespan", "David Sinclair", "Health", "9781501191978"],

    // PSYCHOLOGY & SCIENCE
    ["33", "Nação Dopamina", "Dopamine Nation", "Dr. Anna Lembke", "Psychology", "9781524746728"],
    ["34", "Rápido e Devagar", "Thinking, Fast and Slow", "Daniel Kahneman", "Psychology", "9780374275631"],
    ["35", "Previsivelmente Irracional", "Predictably Irrational", "Dan Ariely", "Psychology", "9780061353239"],
    ["36", "As Armas da Persuasão", "Influence", "Robert Cialdini", "Psychology", "9780061241895"],
    ["37", "Inteligência Emocional", "Emotional Intelligence", "Daniel Goleman", "Psychology", "9780553095036"],
    ["38", "O Poder dos Quietos", "Quiet", "Susan Cain", "Psychology", "9780307352149"],
    ["39", "Desfira-se", "Unwind", "Judson Brewer", "Psychology", "9780593330449"], // Unwinding Anxiety
    ["40", "Comportamento", "Behave", "Robert Sapolsky", "Science", "9781594205071"],
    ["41", "O Gene Egoísta", "The Selfish Gene", "Richard Dawkins", "Science", "9780198788607"],
    ["42", "Sapiens", "Sapiens", "Yuval Noah Harari", "Science", "9780062316097"],
    ["43", "Cosmos", "Cosmos", "Carl Sagan", "Science", "9780345331309"],

    // PHILOSOPHY & STOICISM
    ["44", "Meditações", "Meditations", "Marcus Aurelius", "Philosophy", "9780812968255"],
    ["45", "Cartas de um Estoico", "Letters from a Stoic", "Seneca", "Philosophy", "9780140442106"],
    ["46", "O Ego é seu Inimigo", "Ego Is the Enemy", "Ryan Holiday", "Philosophy", "9781591847816"],
    ["47", "O Obstáculo é o Caminho", "The Obstacle Is the Way", "Ryan Holiday", "Philosophy", "9781591846352"],
    ["48", "Aquiete a Mente", "Stillness Is the Key", "Ryan Holiday", "Philosophy", "9780525538585"],
    ["49", "Sobre a Brevidade da Vida", "On the Shortness of Life", "Seneca", "Philosophy", "9780143036326"],
    ["50", "Antifrágil", "Antifragile", "Nassim Nicholas Taleb", "Philosophy", "9781400067824"],
    ["51", "A Lógica do Cisne Negro", "The Black Swan", "Nassim Nicholas Taleb", "Philosophy", "9781400063512"],
    ["52", "Arriscando a Própria Pele", "Skin in the Game", "Nassim Nicholas Taleb", "Philosophy", "9780425284629"],
    ["53", "12 Regras para a Vida", "12 Rules for Life", "Jordan Peterson", "Philosophy", "9780345816023"],
    ["54", "Tao Te Ching", "Tao Te Ching", "Lao Tzu", "Philosophy", "9780061142666"],

    // BUSINESS & STRATEGY
    ["55", "Zero a Um", "Zero to One", "Peter Thiel", "Business", "9780804139298"],
    ["56", "Trabalhe 4 Horas por Semana", "The 4-Hour Work Week", "Tim Ferriss", "Business", "9780307465351"],
    ["57", "A Startup Enxuta", "The Lean Startup", "Eric Ries", "Business", "9780307887894"],
    ["58", "Empresas Feitas para Vencer", "Good to Great", "Jim Collins", "Business", "9780066620992"],
    ["59", "Princípios", "Principles", "Ray Dalio", "Business", "9781501124020"],
    ["60", "Pense de Novo", "Think Again", "Adam Grant", "Business", "9781984878106"],
    ["61", "Comece pelo Porquê", "Start with Why", "Simon Sinek", "Business", "9781591846444"],
    ["62", "Líderes Se Servem Por Último", "Leaders Eat Last", "Simon Sinek", "Business", "9781591845324"],
    ["63", "O Lado Difícil das Situações Difíceis", "The Hard Thing About Hard Things", "Ben Horowitz", "Business", "9780062273208"],
    ["64", "De Zero a Um", "Blue Ocean Strategy", "W. Chan Kim", "Strategy", "9781625274496"],
    ["65", "A Arte da Guerra", "The Art of War", "Sun Tzu", "Strategy", "9781590302255"],
    ["66", "O Príncipe", "The Prince", "Niccolò Machiavelli", "Strategy", "9780553212785"],
    ["67", "As 48 Leis do Poder", "The 48 Laws of Power", "Robert Greene", "Strategy", "9780140280197"],
    ["68", "Maestria", "Mastery", "Robert Greene", "Strategy", "9780143124177"],
    ["69", "Range", "Range", "David Epstein", "Strategy", "9780735214484"],
    
    // BIOGRAPHY
    ["70", "Steve Jobs", "Steve Jobs", "Walter Isaacson", "Biography", "9781451648539"],
    ["71", "Elon Musk", "Elon Musk", "Ashlee Vance", "Biography", "9780062301239"],
    ["72", "Shoe Dog (A Marca da Vitória)", "Shoe Dog", "Phil Knight", "Biography", "9781501135910"],
    ["73", "Einstein", "Einstein", "Walter Isaacson", "Biography", "9780743264730"],
    ["74", "Leonardo da Vinci", "Leonardo da Vinci", "Walter Isaacson", "Biography", "9781501139154"],
    ["75", "Benjamin Franklin", "Benjamin Franklin", "Walter Isaacson", "Biography", "9780743258074"],
    ["76", "Titan", "Titan", "Ron Chernow", "Biography", "9781400077304"],
    ["77", "A Loja de Tudo", "The Everything Store", "Brad Stone", "Biography", "9780316219266"],
    ["78", "Total Recall", "Total Recall", "Arnold Schwarzenegger", "Biography", "9781451662436"],
    ["79", "Greenlights", "Greenlights", "Matthew McConaughey", "Biography", "9780593139134"],
    ["80", "Becoming", "Becoming", "Michelle Obama", "Biography", "9781524763138"],

    // MORE MIXED
    ["81", "Não Me Faça Pensar", "Don't Make Me Think", "Steve Krug", "Business", "9780321965516"],
    ["82", "Hooked", "Hooked", "Nir Eyal", "Business", "9781591847786"],
    ["83", "Contágio", "Contagious", "Jonah Berger", "Business", "9781451686579"],
    ["84", "Roube Como um Artista", "Steal Like an Artist", "Austin Kleon", "Strategy", "9780761169253"],
    ["85", "Mostre Seu Trabalho", "Show Your Work!", "Austin Kleon", "Strategy", "9780761178972"],
    ["86", "Ferramentas dos Titãs", "Tools of Titans", "Tim Ferriss", "Strategy", "9781328683786"],
    ["87", "Tribos", "Tribes", "Seth Godin", "Business", "9781591842330"],
    ["88", "A Vaca Roxa", "Purple Cow", "Seth Godin", "Business", "9781591840213"],
    ["89", "O Jeito Disney", "The Disney Way", "Bill Capodagli", "Business", "9780071478151"],
    ["90", "Criatividade S.A.", "Creativity, Inc.", "Ed Catmull", "Business", "9780812993011"],
    ["91", "Pai Rico, Pai Pobre", "Rich Dad Poor Dad", "Robert Kiyosaki", "Business", "9781612680194"],
    ["92", "O Homem Mais Rico da Babilônia", "The Richest Man in Babylon", "George S. Clason", "Business", "9780451205360"],
    ["93", "Psicologia Financeira", "The Psychology of Money", "Morgan Housel", "Psychology", "9780857197689"],
    ["94", "Essencial", "Essentialism", "Greg McKeown", "Focus", "9780804137386"], 
    ["95", "10% Mais Feliz", "10% Happier", "Dan Harris", "Psychology", "9780062265425"],
    ["96", "O Milagre da Manhã", "The Miracle Morning", "Hal Elrod", "Habits", "9780979019715"],
    ["97", "Fome de Poder", "Grinding It Out", "Ray Kroc", "Biography", "9781250127501"],
    ["98", "Originals", "Originals", "Adam Grant", "Psychology", "9780525429562"],
    ["99", "O Poder do Agora", "The Power of Now", "Eckhart Tolle", "Philosophy", "9781577314806"],
    ["100", "Blink", "Blink", "Malcolm Gladwell", "Psychology", "9780316172325"],
    ["101", "Outliers", "Outliers", "Malcolm Gladwell", "Psychology", "9780316017930"],
  ];

  // Helper to get localized category name
  const getCategoryName = (cat: BookCategory) => {
      if (!isPt) return cat;
      const map: Record<string, string> = {
          'Focus': 'Foco',
          'Habits': 'Hábitos',
          'Sleep': 'Sono',
          'Psychology': 'Psicologia',
          'Health': 'Saúde',
          'Philosophy': 'Filosofia',
          'Business': 'Negócios',
          'Biography': 'Biografia',
          'Strategy': 'Estratégia',
          'Science': 'Ciência'
      };
      return map[cat] || cat;
  };

  return rawData.map(([id, titlePt, titleEn, author, category, isbn]) => {
      const title = isPt ? titlePt : titleEn;
      const categoryName = getCategoryName(category);
      const summary = isPt 
        ? `Um livro essencial sobre ${categoryName.toLowerCase()} escrito por ${author}.` 
        : `An essential book on ${category.toLowerCase()} by ${author}.`;
        
      return {
          id,
          title,
          author,
          category, // Keep original ID for logic
          summary,
          status: 'unread',
          progress: 0,
          coverUrl: getCover(isbn),
          buyLink: getBuyLink(title, author)
      };
  });
};

const ACHIEVEMENTS: Achievement[] = [
    { id: 'novice', icon: '🌱', title_en: 'Novice Reader', title_pt: 'Leitor Novato', desc_en: 'Finished 1 book', desc_pt: 'Terminou 1 livro', threshold: 1 },
    { id: 'scholar', icon: '🎓', title_en: 'Scholar', title_pt: 'Erudito', desc_en: 'Finished 5 books', desc_pt: 'Terminou 5 livros', threshold: 5 },
    { id: 'sage', icon: '🧙‍♂️', title_en: 'Sage', title_pt: 'Sábio', desc_en: 'Finished 10 books', desc_pt: 'Terminou 10 livros', threshold: 10 },
    { id: 'legend', icon: '👑', title_en: 'Legend', title_pt: 'Lenda', desc_en: 'Finished 25 books', desc_pt: 'Terminou 25 livros', threshold: 25 },
];

export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ lang, user }) => {
  const t = CONTENT[lang].knowledge;
  const isPt = lang === 'pt';
  
  // State
  const [books, setBooks] = useState<BookResource[]>(getBooks(lang));
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [yearlyGoal, setYearlyGoal] = useState(12);
  const [isLoading, setIsLoading] = useState(true);

  // Sync with DB
  useEffect(() => {
     const fetchLibrary = async () => {
         setIsLoading(true);
         const userBooks = await getUserLibrary(user.id);
         
         setBooks(prevBooks => {
             const baseBooks = getBooks(lang);
             // Merge strategy:
             // 1. Map active user books to base books (update status/progress)
             // 2. Add custom user books that are not in base
             
             const merged = baseBooks.map(b => {
                 // Try to find by title (fuzzy matching for MVP)
                 const match = userBooks.find(ub => ub.title === b.title);
                 if (match) {
                     return { ...b, status: match.status, progress: match.progress };
                 }
                 return b;
             });

             // Add custom books (those not in base list)
             const customBooks = userBooks.filter(ub => !baseBooks.some(b => b.title === ub.title));
             
             return [...merged, ...customBooks];
         });
         setIsLoading(false);
     };
     fetchLibrary();
  }, [lang, user.id]);

  // New Book Form State
  const [newBook, setNewBook] = useState({ title: '', author: '', category: 'Focus', coverUrl: '', buyLink: '' });

  // Computed
  const booksRead = books.filter(b => b.status === 'completed').length;
  const currentReads = books.filter(b => b.status === 'reading');
  
  // Progress Calculation
  const progressPercentage = Math.min(100, Math.round((booksRead / yearlyGoal) * 100));

  const filteredBooks = books.filter(b => {
      const matchCat = filterCategory === 'ALL' || b.category === filterCategory;
      const matchSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
  });

  const categories: string[] = (Array.from(new Set(books.map(b => b.category))) as string[]).sort();

  // CATEGORY TRANSLATION MAP
  const getCategoryLabel = (cat: string) => {
      if (cat === 'ALL') return isPt ? 'Todos' : 'All';
      if (!isPt) return cat;
      const map: Record<string, string> = {
          'Focus': 'Foco',
          'Habits': 'Hábitos',
          'Sleep': 'Sono',
          'Psychology': 'Psicologia',
          'Health': 'Saúde',
          'Philosophy': 'Filosofia',
          'Business': 'Negócios',
          'Biography': 'Biografia',
          'Strategy': 'Estratégia',
          'Science': 'Ciência'
      };
      return map[cat] || cat;
  };

  const handleUpdateProgress = async (id: string, newProgress: number) => {
      const updatedList = books.map(b => {
          if (b.id !== id) return b;
          const updated = { ...b, progress: newProgress };
          if (newProgress >= 100) updated.status = 'completed';
          else if (newProgress > 0) updated.status = 'reading';
          else updated.status = 'unread';
          
          // Sync to DB
          syncBookStatus(user.id, updated);
          return updated;
      });
      setBooks(updatedList);
  };

  const handleToggleStatus = async (id: string) => {
      const updatedList = books.map(b => {
          if (b.id !== id) return b;
          let updated;
          if (b.status === 'completed') updated = { ...b, status: 'unread', progress: 0 };
          else if (b.status === 'unread') updated = { ...b, status: 'reading', progress: 10 };
          else updated = { ...b, status: 'completed', progress: 100 };
          
          // Sync to DB
          syncBookStatus(user.id, updated as BookResource);
          return updated as BookResource;
      });
      setBooks(updatedList);
  };

  const handleAddBook = async () => {
      if (!newBook.title || !newBook.author) return;
      const book: BookResource = {
          id: `custom-${Date.now()}`,
          title: newBook.title,
          author: newBook.author,
          category: newBook.category as BookCategory,
          summary: lang === 'pt' ? 'Livro adicionado manualmente.' : 'User added book.',
          coverUrl: newBook.coverUrl,
          status: 'unread',
          progress: 0,
          isUserAdded: true,
          buyLink: newBook.buyLink || getBuyLink(newBook.title, newBook.author)
      };
      
      // Optimistic update
      setBooks([book, ...books]);
      
      // Sync DB
      await syncBookStatus(user.id, book);

      setIsAddModalOpen(false);
      setNewBook({ title: '', author: '', category: 'Focus', coverUrl: '', buyLink: '' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-start">
        <div>
           <h1 className="text-3xl font-bold text-lab-900">{t.title}</h1>
           <p className="text-lab-500 mt-1">{t.subtitle}</p>
        </div>
        <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-lab-900 text-white px-4 py-2 rounded-lg flex items-center font-bold text-sm hover:bg-lab-800"
        >
            <Plus className="w-4 h-4 mr-2" /> {t.addBook}
        </button>
      </header>

      {/* DASHBOARD SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Progress Card */}
          <div className="bg-white p-6 rounded-2xl border border-lab-200 shadow-sm relative overflow-hidden">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="font-bold text-lab-900">{t.goal}</h3>
                   <span className="text-xs font-bold bg-lab-100 text-lab-600 px-2 py-1 rounded">{new Date().getFullYear()}</span>
               </div>
               <div className="flex items-end gap-2 mb-2">
                   <span className="text-4xl font-bold text-primary-600">{booksRead}</span>
                   <span className="text-lab-400 mb-1">/ {yearlyGoal} {t.booksRead.toLowerCase()}</span>
               </div>
               <div className="w-full bg-lab-100 h-3 rounded-full overflow-hidden">
                   <div className="bg-primary-500 h-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
               </div>
          </div>

          {/* Current Reads */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-lab-200 shadow-sm">
               <h3 className="font-bold text-lab-900 mb-4 flex items-center">
                   <BookOpen className="w-4 h-4 mr-2 text-primary-500" /> {t.reading}
               </h3>
               {currentReads.length > 0 ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {currentReads.slice(0, 4).map(book => (
                           <div key={book.id} className="flex items-center gap-3 bg-lab-50 p-3 rounded-lg border border-lab-100">
                               <div className="w-12 h-16 bg-lab-200 rounded flex-shrink-0 bg-cover bg-center shadow-sm border border-lab-200" style={{ backgroundImage: book.coverUrl ? `url(${book.coverUrl})` : undefined }}>
                                   {!book.coverUrl && <span className="flex items-center justify-center h-full text-xs">📖</span>}
                               </div>
                               <div className="flex-1 min-w-0">
                                   <div className="flex justify-between mb-1">
                                       <span className="font-bold text-sm text-lab-800 line-clamp-1">{book.title}</span>
                                       <span className="text-xs font-mono text-lab-500">{book.progress}%</span>
                                   </div>
                                   <input 
                                        type="range" 
                                        min="0" max="100" 
                                        value={book.progress}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateProgress(book.id, parseInt(e.target.value))}
                                        className="w-full h-2 bg-lab-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                   />
                               </div>
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="text-lab-400 text-sm italic py-4">{lang === 'pt' ? 'Nenhum livro em andamento.' : 'No active books.'}</div>
               )}
          </div>
      </div>

      {/* ACHIEVEMENTS */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {ACHIEVEMENTS.map(ach => {
              const unlocked = booksRead >= ach.threshold;
              return (
                  <div key={ach.id} className={`flex-shrink-0 w-48 p-4 rounded-xl border flex flex-col items-center text-center transition-all ${unlocked ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-50 grayscale'}`}>
                      <div className="text-3xl mb-2">{ach.icon}</div>
                      <div className="font-bold text-sm text-lab-900">{lang === 'pt' ? ach.title_pt : ach.title_en}</div>
                      <div className="text-xs text-lab-500">{lang === 'pt' ? ach.desc_pt : ach.desc_en}</div>
                  </div>
              );
          })}
      </div>

      {/* LIBRARY FILTER & LIST */}
      <div className="bg-white rounded-2xl border border-lab-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-lab-100 flex flex-col md:flex-row gap-4 justify-between bg-lab-50">
              <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-lab-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-lab-300 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                  <button 
                      onClick={() => setFilterCategory('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${filterCategory === 'ALL' ? 'bg-lab-900 text-white' : 'bg-white border border-lab-200 text-lab-600 hover:bg-lab-100'}`}
                  >
                      {getCategoryLabel('ALL')}
                  </button>
                  {categories.map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setFilterCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition ${filterCategory === cat ? 'bg-lab-900 text-white' : 'bg-white border border-lab-200 text-lab-600 hover:bg-lab-100'}`}
                    >
                        {getCategoryLabel(cat)}
                    </button>
                  ))}
              </div>
          </div>

          {isLoading ? (
              <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 text-primary-600 animate-spin"/></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 p-6 bg-lab-50/50">
                {filteredBooks.map(book => (
                    <div key={book.id} className="flex flex-col h-full group bg-white rounded-xl border border-lab-200 shadow-sm hover:shadow-md transition-all overflow-hidden relative">
                        
                        {/* Cover Area - Ratio 2:3 */}
                        <div className="aspect-[2/3] w-full bg-lab-100 relative overflow-hidden">
                            {book.coverUrl ? (
                                <img 
                                    src={book.coverUrl} 
                                    alt={book.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-lab-300">
                                    <BookOpen className="w-12 h-12 mb-2" />
                                    <span className="text-xs">No Cover</span>
                                </div>
                            )}
                            
                            {/* Badges */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1">
                                {book.status === 'completed' && <div className="bg-green-500 text-white p-1 rounded-full shadow-lg"><CheckCircle className="w-4 h-4" /></div>}
                                {book.status === 'reading' && <div className="bg-blue-500 text-white p-1 rounded-full shadow-lg"><Bookmark className="w-4 h-4" /></div>}
                            </div>
                            
                            {/* Overlay Actions (Hover) */}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                    {book.buyLink && (
                                        <a 
                                            href={book.buyLink} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            title="Buy on Amazon"
                                            className="p-3 bg-white text-lab-900 rounded-full hover:bg-primary-500 hover:text-white transition-colors"
                                        >
                                            <ShoppingBag className="w-5 h-5" />
                                        </a>
                                    )}
                            </div>
                        </div>
                        
                        <div className="p-3 flex-1 flex flex-col">
                            <div className="mb-1">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded border border-primary-100">{getCategoryLabel(book.category)}</span>
                            </div>
                            <h3 className="font-bold text-lab-900 text-sm leading-tight mb-1 line-clamp-2" title={book.title}>{book.title}</h3>
                            <p className="text-xs text-lab-500 mb-3">{book.author}</p>
                            
                            <div className="mt-auto">
                                <button 
                                    onClick={() => handleToggleStatus(book.id)}
                                    className={`w-full py-1.5 rounded-lg text-[10px] font-bold border transition uppercase tracking-wide ${
                                        book.status === 'completed' 
                                        ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                                        : (book.status === 'reading' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-lab-200 text-lab-600 hover:bg-lab-50')
                                    }`}
                                >
                                    {book.status === 'completed' ? t.markUnread : (book.status === 'reading' ? t.markRead : t.startReading)}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          )}
      </div>

      {/* ADD BOOK MODAL */}
      {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-lab-900">{t.addModal.title}</h3>
                      <button onClick={() => setIsAddModalOpen(false)}><X className="w-5 h-5 text-lab-500 hover:text-red-500" /></button>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-lab-500 uppercase mb-1">{t.addModal.name}</label>
                          <input 
                            type="text" 
                            className="w-full p-2 border border-lab-300 rounded-lg text-sm"
                            value={newBook.title}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({...newBook, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-lab-500 uppercase mb-1">{t.addModal.author}</label>
                          <input 
                            type="text" 
                            className="w-full p-2 border border-lab-300 rounded-lg text-sm"
                            value={newBook.author}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({...newBook, author: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-lab-500 uppercase mb-1">{t.addModal.category}</label>
                              <select 
                                className="w-full p-2 border border-lab-300 rounded-lg text-sm bg-white"
                                value={newBook.category}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewBook({...newBook, category: e.target.value})}
                              >
                                  {categories.map(c => <option key={c} value={c}>{getCategoryLabel(c)}</option>)}
                              </select>
                          </div>
                          <div>
                             <label className="block text-xs font-bold text-lab-500 uppercase mb-1">{t.addModal.cover}</label>
                             <div className="relative">
                                <ImageIcon className="absolute left-2 top-2.5 w-4 h-4 text-lab-400" />
                                <input 
                                    type="text" 
                                    placeholder="https://..."
                                    className="w-full pl-8 p-2 border border-lab-300 rounded-lg text-sm"
                                    value={newBook.coverUrl}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({...newBook, coverUrl: e.target.value})}
                                />
                             </div>
                          </div>
                      </div>
                      
                      <div>
                          <label className="block text-xs font-bold text-lab-500 uppercase mb-1">Link de Compra (Opcional)</label>
                          <div className="relative">
                            <ExternalLink className="absolute left-2 top-2.5 w-4 h-4 text-lab-400" />
                            <input 
                                type="text" 
                                placeholder="https://amazon.com..."
                                className="w-full pl-8 p-2 border border-lab-300 rounded-lg text-sm"
                                value={newBook.buyLink}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBook({...newBook, buyLink: e.target.value})}
                            />
                         </div>
                      </div>

                      <div className="pt-4 flex gap-3">
                          <button 
                            onClick={handleAddBook}
                            className="flex-1 bg-lab-900 text-white py-2.5 rounded-lg font-bold hover:bg-lab-800"
                          >
                              {t.addModal.add}
                          </button>
                          <button 
                            onClick={() => setIsAddModalOpen(false)}
                            className="px-4 py-2.5 border border-lab-300 rounded-lg font-bold text-lab-600 hover:bg-lab-50"
                          >
                              {t.addModal.cancel}
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
