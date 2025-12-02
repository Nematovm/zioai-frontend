// ============================================
// ARTICLES TOOL - COMPLETE FIXED VERSION ✅
// ============================================

// ✅ DYNAMIC API URL - Render.com bilan ham ishlaydi
const ARTICLE_API_URL =
    window.location.hostname.includes("onrender.com")
    ? "https://zioai-backend.onrender.com/api"
    : "http://localhost:3000/api";

let articlesData = [];
let currentArticleView = 'list';
let selectedArticle = null;
let selectedArticleLanguage = 'uz';
let userSummary = '';
let highlightedText = '';

// ✅ STORAGE KEYS - FAQAT BIR MARTA!
const ARTICLES_STORAGE = {
  CURRENT_ARTICLE: 'articles_current_article',
  ARTICLE_VIEW: 'articles_current_view',
  CUSTOM_VOCABULARY: 'articles_custom_vocabulary',
  USER_SUMMARY: 'articles_user_summary',
  ARTICLES_DATA: 'articles_data_cache'
};

console.log('🌐 Using API URL:', ARTICLE_API_URL);

// Save to localStorage
function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`💾 Saved to localStorage:`, key);
  } catch (error) {
    console.error('❌ LocalStorage save error:', error);
  }
}

// Load from localStorage
function loadFromLocalStorage(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('❌ LocalStorage load error:', error);
    return null;
  }
}

// Clear localStorage
function clearArticleStorage() {
  Object.values(ARTICLES_STORAGE).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('🗑️ Article storage cleared');
}

// ============================================
// INITIALIZE ARTICLES - ✅ WITH RESTORE STATE + DEBUG
// ============================================
async function initArticles() {
  console.log('📚 Initializing Articles Tool...');
  
  const container = document.getElementById('articlesListContainer');
  
  if (!container) {
    console.error('❌ Container not found: articlesListContainer');
    alert('Error: Articles container not found in HTML!');
    return;
  }
  
  console.log('✅ Container found:', container);
  
  // ✅ CHECK IF USER WAS READING AN ARTICLE
  const savedArticleId = loadFromLocalStorage(STORAGE_KEYS.CURRENT_ARTICLE);
  const savedView = loadFromLocalStorage(STORAGE_KEYS.ARTICLE_VIEW);
  
  if (savedArticleId && savedView === 'article') {
    console.log('🔄 Restoring previous article:', savedArticleId);
    
    // Load articles first
    if (articlesData.length === 0) {
      try {
        console.log('📡 Fetching articles from API...');
        const response = await fetch(`${ARTICLE_API_URL}/articles`);
        console.log('📥 Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          articlesData = data.articles || [];
          console.log('✅ Articles loaded:', articlesData.length);
        }
      } catch (error) {
        console.error('❌ Error loading articles:', error);
      }
    }
    
    // Restore the article
    selectedArticle = articlesData.find(a => a.id === savedArticleId);
    if (selectedArticle) {
      currentArticleView = 'article';
      
      // ✅ RESTORE USER-ADDED VOCABULARY
      const customVocab = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_VOCABULARY);
      if (customVocab && customVocab[savedArticleId]) {
        selectedArticle.vocabulary = [
          ...(selectedArticle.vocabulary || []),
          ...customVocab[savedArticleId]
        ];
      }
      
      // ✅ RESTORE USER SUMMARY
      userSummary = loadFromLocalStorage(STORAGE_KEYS.USER_SUMMARY) || '';
      
      renderArticleView();
      console.log('✅ Article restored successfully');
      return;
    }
  }
  
  // ✅ DEFAULT: SHOW ARTICLES LIST
  container.innerHTML = `
    <div class="articles-loading" style="text-align: center; padding: 60px;">
      <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p style="margin-top: 20px; color: #6b7280; font-size: 1.1rem; font-weight: 600;">
        📄 Loading PDF articles...
      </p>
    </div>
  `;
  
  console.log('⏳ Loading spinner displayed');
  
  try {
    console.log('📡 Fetching articles from:', `${ARTICLE_API_URL}/articles`);
    const response = await fetch(`${ARTICLE_API_URL}/articles`);
    
    console.log('📥 Response received:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('📦 Data received:', data);
    
    if (data.success && data.articles && data.articles.length > 0) {
      articlesData = data.articles;
      console.log(`✅ Loaded ${articlesData.length} articles:`, articlesData);
      
      // ✅ FORCE RENDER
      setTimeout(() => {
        console.log('🎨 Rendering articles list...');
        renderArticlesList();
      }, 100);
    } else {
      throw new Error('No articles found in response');
    }
    
  } catch (error) {
    console.error('❌ Error loading articles:', error);
    showArticlesError(`Failed to load articles: ${error.message}`);
  }
}

// ============================================
// RENDER ARTICLES LIST
// ============================================
function renderArticlesList() {
  const container = document.getElementById('articlesListContainer');
  
  if (!container || !articlesData || articlesData.length === 0) {
    showArticlesError('No articles available');
    return;
  }
  
  container.innerHTML = `
    <div class="articles-header">
      <h2>📚 Reading Articles</h2>
      <p class="articles-subtitle">
        ${articlesData.length} articles • Improve your English reading skills
      </p>
      
      <div class="language-selector-inline">
        <i class="bi bi-globe"></i>
        <span>Vocabulary Language:</span>
        <select id="articlesLanguageSelect" onchange="changeArticleLanguage(this.value)">
          <option value="uz" ${selectedArticleLanguage === 'uz' ? 'selected' : ''}>🇺🇿 O'zbek</option>
          <option value="ru" ${selectedArticleLanguage === 'ru' ? 'selected' : ''}>🇷🇺 Русский</option>
          <option value="en" ${selectedArticleLanguage === 'en' ? 'selected' : ''}>🇬🇧 English</option>
        </select>
      </div>
    </div>
    
    <div class="articles-grid">
      ${articlesData.map(article => `
        <div class="article-card" onclick="openArticle('${article.id}')">
          <div class="article-card-header ${getArticleLevelClass(article.level)}">
            <div class="article-category">
              <i class="bi bi-file-pdf"></i> ${article.category}
            </div>
            <div class="article-level-badge">${article.level}</div>
          </div>
          
          <div class="article-card-body">
            <h3 class="article-title">${article.title}</h3>
            <p class="article-description">${article.description}</p>
            
            <div class="article-meta">
              <span class="article-meta-item">
                <i class="bi bi-clock"></i> ${article.readTime}
              </span>
              <span class="article-meta-item">
                <i class="bi bi-book"></i> ${article.vocabulary?.length || 0} words
              </span>
            </div>
          </div>
          
          <div class="article-card-footer">
            <button class="article-read-btn">
              Read Article
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================
// OPEN ARTICLE VIEW - ✅ WITH STATE SAVING
// ============================================
function openArticle(articleId) {
  selectedArticle = articlesData.find(a => a.id === articleId);
  
  if (!selectedArticle) {
    console.error('❌ Article not found:', articleId);
    alert('Article not found!');
    return;
  }
  
  console.log('📖 Opening article:', selectedArticle.title);
  currentArticleView = 'article';
  
  // ✅ SAVE STATE
  saveToLocalStorage(STORAGE_KEYS.CURRENT_ARTICLE, articleId);
  saveToLocalStorage(STORAGE_KEYS.ARTICLE_VIEW, 'article');
  
  // ✅ RESTORE USER-ADDED VOCABULARY
  const customVocab = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_VOCABULARY);
  if (customVocab && customVocab[articleId]) {
    selectedArticle.vocabulary = [
      ...(selectedArticle.vocabulary || []),
      ...customVocab[articleId]
    ];
  }
  
  // ✅ RESTORE USER SUMMARY (if exists)
  const savedSummary = loadFromLocalStorage(STORAGE_KEYS.USER_SUMMARY);
  if (savedSummary) {
    userSummary = savedSummary;
  } else {
    userSummary = '';
  }
  
  highlightedText = '';
  
  renderArticleView();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// RENDER ARTICLE VIEW
// ============================================
function renderArticleView() {
  const container = document.getElementById('articlesListContainer');
  
  if (!container || !selectedArticle) return;
  
  const formattedContent = selectedArticle.content
    .split('\n\n')
    .filter(p => p.trim().length > 0)
    .map(p => `<p>${p.trim()}</p>`)
    .join('');
  
  const highlightedContent = highlightVocabularyInText(
    formattedContent, 
    selectedArticle.vocabulary || []
  );
  
  container.innerHTML = `
    <button class="article-back-btn" onclick="backToArticlesList()">
      <i class="bi bi-arrow-left"></i>
      Back to Articles
    </button>
    
    <div class="article-view-header">
      <div class="article-view-badges">
        <span class="article-level-badge ${getArticleLevelClass(selectedArticle.level)}">
          ${selectedArticle.level}
        </span>
        <span class="article-category-badge">
          <i class="bi bi-file-pdf"></i> ${selectedArticle.category}
        </span>
      </div>
      
      <h1 class="article-view-title">${selectedArticle.title}</h1>
      
      <div class="article-view-meta">
        <span><i class="bi bi-clock"></i> ${selectedArticle.readTime}</span>
        <span><i class="bi bi-book"></i> ${selectedArticle.vocabulary?.length || 0} advanced words</span>
      </div>
    </div>
    
    <div class="article-view-content">
      <div id="articleTextContent" class="article-text" onmouseup="handleTextSelection()">
        ${highlightedContent}
      </div>
      
      <div id="selectedTextTooltip" class="selected-text-tooltip" style="display: none;">
        <button onclick="highlightSelectedText()" class="highlight-btn">
          <i class="bi bi-pen-fill"></i> Highlight
        </button>
      </div>
    </div>
    
    ${(selectedArticle.vocabulary && selectedArticle.vocabulary.length > 0) ? `
    <div class="article-vocabulary-section">
      <h2 class="section-title">
        <i class="bi bi-book-half"></i>
        Advanced Vocabulary (C1-C2 Level)
      </h2>
      
      <div id="vocabularyGridContainer" class="vocabulary-grid">
        ${renderVocabularyCards(selectedArticle.vocabulary)}
      </div>
    </div>
    ` : ''}
    
    <div class="article-summary-section">
      <h2 class="section-title">
        <i class="bi bi-pencil-square"></i>
        Write Your Summary
      </h2>
      
      <p class="summary-instruction">
        📝 Summarize the article in your own words (50-500 words). AI will analyze and give feedback.
      </p>
      
      <textarea 
        id="articleSummaryInput"
        class="summary-textarea"
        placeholder="Write your summary here in English..."
        oninput="updateSummaryValue(this.value)"
      ></textarea>
      
      <div style="text-align: right; color: #6b7280; font-size: 0.9rem; margin-top: 5px;">
        <span id="summaryWordCount">0</span> / 500 words
      </div>
      
      <button 
        class="summary-submit-btn" 
        onclick="submitSummary()"
        id="submitSummaryBtn"
      >
        <i class="bi bi-magic"></i>
        Get AI Feedback
      </button>
      
      <div id="summaryFeedbackDisplay" style="display: none;"></div>
    </div>
  `;
  // ✅ RESTORE USER SUMMARY (add after textarea is created)
setTimeout(() => {
  const summaryInput = document.getElementById('articleSummaryInput');
  if (summaryInput && userSummary) {
    summaryInput.value = userSummary;
    updateSummaryValue(userSummary); // Update word count
  }
}, 100);
  enableVocabularyTooltips();
}

// ============================================
// HIGHLIGHT VOCABULARY IN TEXT
// ============================================
function highlightVocabularyInText(content, vocabulary) {
  if (!vocabulary || vocabulary.length === 0) return content;
  
  let highlighted = content;
  
  vocabulary.forEach(vocab => {
    const regex = new RegExp(`\\b(${escapeRegex(vocab.word)})\\b`, 'gi');
    highlighted = highlighted.replace(
      regex, 
      `<mark class="vocab-highlight" data-word="${vocab.word.toLowerCase()}" data-definition="${escapeHtml(vocab.definition)}">$1</mark>`
    );
  });
  
  return highlighted;
}

// ============================================
// RENDER VOCABULARY CARDS
// ============================================
function renderVocabularyCards(vocabulary) {
  return vocabulary.map((vocab, index) => `
    <div class="vocabulary-card" id="vocab-card-${index}" data-word="${vocab.word.toLowerCase()}">
      <div class="vocab-word">${vocab.word}</div>
      <div class="vocab-definition">
        📖 ${vocab.definition}
      </div>
      <div class="vocab-translation">
        ${getVocabTranslation(vocab)}
      </div>
      ${vocab.example ? `
        <div class="vocab-example">
          <i class="bi bi-chat-quote"></i>
          <em>"${vocab.example}"</em>
        </div>
      ` : ''}
    </div>
  `).join('');
}

// ============================================
// GET VOCABULARY TRANSLATION
// ============================================
function getVocabTranslation(vocab) {
  const translations = {
    'uz': vocab.translation_uz || `${vocab.word} (tarjima)`,
    'ru': vocab.translation_ru || `${vocab.word} (перевод)`,
    'en': vocab.definition
  };
  
  const flags = {
    'uz': '🇺🇿',
    'ru': '🇷🇺',
    'en': '🇬🇧'
  };
  
  return `${flags[selectedArticleLanguage]} ${translations[selectedArticleLanguage]}`;
}

// ============================================
// ENABLE VOCABULARY TOOLTIPS - ✅ FIXED POSITIONING
// ============================================
function enableVocabularyTooltips() {
  const highlights = document.querySelectorAll('.vocab-highlight');
  
  highlights.forEach(element => {
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);
    
    newElement.addEventListener('mouseenter', function(e) {
      document.querySelectorAll('.vocab-hover-tooltip').forEach(t => t.remove());
      
      const word = this.getAttribute('data-word');
      const definition = this.getAttribute('data-definition');
      
      const tooltip = document.createElement('div');
      tooltip.className = 'vocab-hover-tooltip';
      tooltip.innerHTML = `
        <strong>${word}</strong><br>
        <span>${definition}</span>
      `;
      
      document.body.appendChild(tooltip);
      
      // ✅ FIXED POSITIONING
      const rect = this.getBoundingClientRect();
      const tooltipHeight = tooltip.offsetHeight;
      
      let top = rect.top + window.scrollY - tooltipHeight - 10;
      if (rect.top < tooltipHeight + 20) {
        top = rect.bottom + window.scrollY + 10;
        tooltip.classList.add('tooltip-below');
      }
      
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (tooltip.offsetWidth / 2)}px`;
      
      const tooltipRect = tooltip.getBoundingClientRect();
      if (tooltipRect.left < 10) {
        tooltip.style.left = '10px';
      } else if (tooltipRect.right > window.innerWidth - 10) {
        tooltip.style.left = `${window.innerWidth - tooltipRect.width - 10}px`;
      }
      
      this._tooltip = tooltip;
      
      const vocabCard = document.querySelector(`#vocabularyGridContainer [data-word="${word}"]`);
      if (vocabCard) {
        vocabCard.classList.add('highlight-flash');
        setTimeout(() => vocabCard.classList.remove('highlight-flash'), 2000);
      }
    });
    
    newElement.addEventListener('mouseleave', function() {
      setTimeout(() => {
        if (this._tooltip) {
          this._tooltip.remove();
          this._tooltip = null;
        }
      }, 100);
    });
  });
}


function handleTextSelection() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (text.length > 0) {
    highlightedText = text;
    
    const tooltip = document.getElementById('selectedTextTooltip');
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    tooltip.style.display = 'block';
    tooltip.style.position = 'fixed';
    tooltip.style.top = `${rect.top - 50}px`;
    tooltip.style.left = `${rect.left + (rect.width / 2) - 50}px`;
  } else {
    document.getElementById('selectedTextTooltip').style.display = 'none';
  }
}

function parseVocabularyResponse(aiResponse, word) {
  console.log('📝 Full AI response:', aiResponse);
  
  // ✅ Clean response
  let cleaned = aiResponse
    .replace(/\*\*/g, '')
    .replace(/#{1,6}\s*/g, '')
    .replace(/^[-•]\s+/gm, '')
    .trim();
  
  console.log('🧹 Cleaned response:', cleaned);
  
  // ✅ Extract DEFINITION - FIXED PATTERNS
  let definition = '';
  
  const defPatterns = [
    /📖\s*MA'NOSI[:：]\s*([^\n]+)/i,
    /MA'NOSI[:：]\s*([^\n]+)/i,
    /📖\s*DEFINITION[:：]\s*([^\n]+)/i,
    /DEFINITION[:：]\s*([^\n]+)/i,
    /📖\s*([A-Z][a-zA-Z\s,'-]{10,})/,  // Any sentence starting with capital
  ];
  
  for (let pattern of defPatterns) {
    const match = cleaned.match(pattern);
    if (match && match[1] && match[1].length > 5) {
      definition = match[1].trim();
      // Take only first sentence
      const sentenceEnd = definition.search(/[.!?]/);
      if (sentenceEnd > 0) {
        definition = definition.substring(0, sentenceEnd).trim();
      }
      break;
    }
  }
  
  // ✅ If no match, try to get first English sentence
  if (!definition) {
    const lines = cleaned.split('\n').filter(l => l.trim().length > 0);
    for (const line of lines) {
      // Skip Uzbek/Russian lines
      if (line.match(/[а-яА-ЯўқғҳҚҒҲЎ]/)) continue;
      // Skip lines with emojis only
      if (line.match(/^[📖🇺🇿💬\s]+$/)) continue;
      // Take first English sentence
      if (line.length > 15 && /[a-zA-Z]/.test(line)) {
        definition = line.trim();
        const sentenceEnd = definition.search(/[.!?]/);
        if (sentenceEnd > 0) {
          definition = definition.substring(0, sentenceEnd).trim();
        }
        break;
      }
    }
  }
  
  // ✅ Extract O'ZBEK translation
  let translation = '';
  
  const uzPatterns = [
    /🇺🇿\s*O'ZBEK[:：]\s*([^\n]+)/i,
    /O'ZBEK[:：]\s*([^\n]+)/i,
    /uz\s+O'ZBEK[:：]\s*([^\n]+)/i,
  ];
  
  for (let pattern of uzPatterns) {
    const match = cleaned.match(pattern);
    if (match && match[1] && match[1].length > 3) {
      translation = match[1].trim();
      // Remove any remaining labels
      translation = translation.replace(/^(uz\s+)?O'ZBEK[:：]?\s*/i, '').trim();
      break;
    }
  }
  
  // ✅ Extract EXAMPLE
  let example = '';
  
  const exPatterns = [
    /💬\s*MISOL[:：]\s*"([^"]+)"/i,
    /MISOL[:：]\s*"([^"]+)"/i,
    /💬\s*EXAMPLE[:：]\s*"([^"]+)"/i,
    /EXAMPLE[:：]\s*"([^"]+)"/i,
    /💬\s*"([^"]+)"/i,
    /"([^"]{20,})"/
  ];
  
  for (let pattern of exPatterns) {
    const match = cleaned.match(pattern);
    if (match && match[1] && match[1].length > 10) {
      example = match[1].trim();
      // Remove problematic phrases
      example = example.replace(/so'zi\s+haqida.*$/gi, '').trim();
      if (example.length > 10) break;
    }
  }
  
  // ✅ Fallback values
  if (!definition || definition.length < 5) {
    definition = `To count or calculate numbers`;
  }
  if (!translation || translation.length < 3) {
    translation = `Sanash, hisoblash`;
  }
  if (!example || example.length < 10) {
    example = `She spent the evening counting her money`;
  }
  
  console.log('✅ Final parsed:', { word, definition, translation, example });
  
  return {
    word: word,
    definition: definition,
    translation_uz: translation,
    translation_ru: translation,
    example: example
  };
}

function showWordTranslation(vocab) {
  console.log('📖 Showing translation for:', vocab);
  
  const existing = document.querySelector('.translation-popup-overlay');
  if (existing) existing.remove();
  
  const popup = document.createElement('div');
  popup.className = 'translation-popup-overlay';
  popup.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    background: rgba(0,0,0,0.5) !important;
    z-index: 99999 !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    animation: fadeIn 0.3s ease !important;
  `;
  
  // ✅ FIXED: Properly display example
  const exampleText = vocab.example || `"${vocab.word}" in a sentence`;
  
  popup.innerHTML = `
    <div class="translation-popup-content" style="
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(245,158,11,0.5);
      max-width: 480px;
      width: 90%;
      border: 3px solid #fbbf24;
      animation: popIn 0.4s ease;
      position: relative;
    ">
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 20px 24px; border-radius: 17px 17px 0 0; display: flex; justify-content: space-between; align-items: center;">
        <h4 style="color: #78350f; margin: 0; font-size: 1.5rem; font-weight: 700; display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 1.3rem;">⭐</span>
          ${vocab.word}
        </h4>
        <button onclick="this.closest('.translation-popup-overlay').remove()" style="background: rgba(255,255,255,0.3); border: none; color: #78350f; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 1.3rem; font-weight: bold; transition: all 0.3s; line-height: 1;">
          ✕
        </button>
      </div>
      
      <div style="padding: 24px;">
        <div style="margin-bottom: 18px; padding-bottom: 16px; border-bottom: 2px solid #fef3c7;">
          <div style="color: #6b7280; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <span>📖</span> Definition
          </div>
          <div style="color: #374151; font-size: 1.05rem; line-height: 1.7; font-weight: 500;">
            ${vocab.definition}
          </div>
        </div>
        
        <div style="padding: 16px; background: #fef3c7; border-radius: 12px; border-left: 4px solid #f59e0b; margin-bottom: 18px;">
          <div style="color: #92400e; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; margin-bottom: 6px;">
            🇺🇿 O'ZBEK TARJIMASI
          </div>
          <span style="color: #92400e; font-weight: 700; font-size: 1.15rem;">
            ${vocab.translation_uz || vocab.word}
          </span>
        </div>
        
        <div style="padding: 16px; background: #f3f4f6; border-radius: 12px; border-left: 4px solid #6366f1;">
          <div style="color: #4b5563; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <span>💬</span> Example Sentence
          </div>
          <div style="color: #374151; font-size: 0.95rem; line-height: 1.6; font-style: italic;">
            "${exampleText}"
          </div>
        </div>
      </div>
      
      <div style="padding: 18px 24px; background: #fffbeb; border-radius: 0 0 17px 17px; text-align: center;">
        <button onclick="this.closest('.translation-popup-overlay').remove()" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; border: none; padding: 12px 32px; border-radius: 12px; font-size: 1.05rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(245,158,11,0.3); transition: all 0.3s;">
          Got it! ✓
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes popIn {
      0% { transform: scale(0.9); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  // Close on backdrop click
  popup.addEventListener('click', (e) => {
    if (e.target === popup) {
      popup.remove();
    }
  });
  
  // Auto close after 15 seconds
  setTimeout(() => {
    if (popup.parentElement) popup.remove();
  }, 15000);
  
  console.log('✅ Translation popup shown with example:', exampleText);
}
async function highlightSelectedText() {
  if (!highlightedText) {
    console.log('⚠️ No text selected');
    return;
  }
  
  console.log('🎯 Highlighting text:', highlightedText);
  
  // Hide selection tooltip immediately
  document.getElementById('selectedTextTooltip').style.display = 'none';
  
  const vocabWords = selectedArticle.vocabulary || [];
  const foundVocab = vocabWords.find(v => 
    highlightedText.toLowerCase().includes(v.word.toLowerCase()) ||
    v.word.toLowerCase().includes(highlightedText.toLowerCase())
  );
  
  let vocabToShow;
  
  if (foundVocab) {
    console.log('✅ Found in vocabulary:', foundVocab.word);
    vocabToShow = foundVocab;
    showWordTranslation(vocabToShow);
    addHighlightedWordToVocab(vocabToShow);
    highlightTextInPlace(highlightedText);
  } else {
    console.log('➕ Fetching translation for new word:', highlightedText);
    
    // ✅ Show loading state
    showTranslationLoading(highlightedText);
    
    try {
    // ✅ Call NEW endpoint for articles
    const response = await fetch(`${ARTICLE_API_URL}/article-vocabulary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        word: highlightedText,
        language: selectedArticleLanguage
      })
    });
      
      if (!response.ok) {
        throw new Error('Translation failed');
      }
      
      const data = await response.json();
      console.log('🔍 Backend response:', data);
      
      // ✅ FIXED: Remove loading popup first
      const loadingPopup = document.querySelector('.translation-loading-popup');
      if (loadingPopup) loadingPopup.remove();
      
      if (data.success && data.result) {
        // ✅ Parse AI response to extract translations
        vocabToShow = parseVocabularyResponse(data.result, highlightedText);
        console.log('✅ Parsed vocabulary:', vocabToShow);
      } else {
        throw new Error('No translation received');
      }
      
    } catch (error) {
      console.error('❌ Translation error:', error);
      
      // ✅ Remove loading popup on error too
      const loadingPopup = document.querySelector('.translation-loading-popup');
      if (loadingPopup) loadingPopup.remove();
      
      // ✅ Fallback with basic info
      vocabToShow = {
        word: highlightedText,
        definition: 'Selected word from the article',
        translation_uz: `${highlightedText} (tarjima topilmadi)`,
        translation_ru: `${highlightedText} (перевод не найден)`,
        example: `"${highlightedText}" - from the article`
      };
    }
    
    showWordTranslation(vocabToShow);
    addHighlightedWordToVocab(vocabToShow);
    highlightTextInPlace(highlightedText);
  }
  
  // Clear selection
  highlightedText = '';
  window.getSelection().removeAllRanges();
  
  console.log('✅ Highlight complete!');
}

function showTranslationLoading(word) {
  const existing = document.querySelector('.translation-loading-popup');
  if (existing) existing.remove();
  
  const popup = document.createElement('div');
  popup.className = 'translation-loading-popup'; // ✅ FIXED class name
  popup.style.cssText = `
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    background: white !important;
    border-radius: 16px !important;
    box-shadow: 0 20px 60px rgba(245,158,11,0.4) !important;
    z-index: 99999 !important;
    max-width: 420px !important;
    width: 90% !important;
    border: 3px solid #fbbf24 !important;
    display: block !important;
    opacity: 1 !important;
  `;
  
  popup.innerHTML = `
    <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 18px 22px; border-radius: 13px 13px 0 0;">
      <h4 style="color: #78350f; margin: 0; font-size: 1.4rem; font-weight: 700;">⭐ ${word}</h4>
    </div>
    <div style="padding: 50px 22px; background: white; text-align: center; border-radius: 0 0 13px 13px;">
      <div style="display: inline-block; width: 50px; height: 50px; border: 5px solid #fef3c7; border-top-color: #f59e0b; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <p style="margin-top: 20px; color: #92400e; font-size: 1.1rem; font-weight: 600;">🔍 Getting translation...</p>
    </div>
  `;
  
  // Add spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(popup);
  console.log('⏳ Loading popup displayed');
}

// ============================================
// HIGHLIGHT TEXT IN PLACE
// ============================================
function highlightTextInPlace(text) {
  const articleText = document.getElementById('articleTextContent');
  const walker = document.createTreeWalker(articleText, NodeFilter.SHOW_TEXT, null);
  
  const textNodes = [];
  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }
  
  textNodes.forEach(node => {
    const parent = node.parentNode;
    if (parent.classList && parent.classList.contains('vocab-highlight')) {
      return;
    }
    
    const regex = new RegExp(`(${escapeRegex(text)})`, 'gi');
    const nodeText = node.textContent;
    
    if (regex.test(nodeText)) {
      const span = document.createElement('span');
      span.innerHTML = nodeText.replace(
        regex,
        '<mark class="user-highlight" title="You highlighted this">$1</mark>'
      );
      parent.replaceChild(span, node);
    }
  });
  
  enableVocabularyTooltips();
}

// ============================================
// ADD HIGHLIGHTED WORD - ✅ WITH DELETE + SAVE
// ============================================
function addHighlightedWordToVocab(vocab) {
  const container = document.getElementById('vocabularyGridContainer');
  if (!container) return;
  
  // ✅ Check if already exists
  const existingCard = container.querySelector(`[data-word="${vocab.word.toLowerCase()}"]`);
  if (existingCard) {
    existingCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    existingCard.classList.add('highlight-flash');
    setTimeout(() => existingCard.classList.remove('highlight-flash'), 3000);
    return;
  }
  
  const exampleText = vocab.example || `"${vocab.word}" in context`;
  
  const cardHTML = `
    <div class="vocabulary-card user-added-vocab" data-word="${vocab.word.toLowerCase()}" style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 12px; animation: slideIn 0.5s ease; box-shadow: 0 4px 12px rgba(245,158,11,0.2); position: relative;">
      
      <button onclick="deleteVocabularyCard('${vocab.word.toLowerCase()}')" style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border: none; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; font-size: 1rem; font-weight: bold; box-shadow: 0 2px 6px rgba(239,68,68,0.4); transition: all 0.3s;" title="Delete this word">
        ✕
      </button>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div style="color: #92400e; font-size: 1.35rem; font-weight: 700;">
          ⭐ ${vocab.word}
        </div>
        <div style="background: #f59e0b; color: white; padding: 4px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 600;">
          NEW
        </div>
      </div>
      
      <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 2px solid #fde68a;">
        <div style="font-size: 0.8rem; color: #92400e; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
          <span>📖</span> Definition
        </div>
        <div style="font-size: 0.95rem; color: #374151; line-height: 1.6;">
          ${vocab.definition}
        </div>
      </div>
      
      <div style="margin-bottom: 12px; padding: 12px; background: #fde68a; border-radius: 8px;">
        <div style="font-size: 0.8rem; color: #92400e; font-weight: 600; text-transform: uppercase; margin-bottom: 4px;">
          🇺🇿 O'ZBEK
        </div>
        <div style="font-size: 1.05rem; color: #78350f; font-weight: 700;">
          ${vocab.translation_uz || vocab.word}
        </div>
      </div>
      
      <div style="padding: 12px; background: #f3f4f6; border-radius: 8px; border-left: 3px solid #6366f1;">
        <div style="font-size: 0.8rem; color: #4b5563; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
          <span>💬</span> Example
        </div>
        <div style="font-size: 0.9rem; color: #374151; font-style: italic; line-height: 1.5;">
          "${exampleText}"
        </div>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', cardHTML);
  
  setTimeout(() => {
    const newCard = container.querySelector(`[data-word="${vocab.word.toLowerCase()}"]`);
    if (newCard) {
      newCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
  
  // ✅ ADD TO ARTICLE VOCABULARY
  if (!selectedArticle.vocabulary) {
    selectedArticle.vocabulary = [];
  }
  selectedArticle.vocabulary.push(vocab);
  
  // ✅ SAVE TO LOCALSTORAGE
  saveCustomVocabulary(selectedArticle.id, vocab);
  
  console.log('✅ Card added with DELETE button');
}
// ============================================
// DELETE VOCABULARY CARD - ✅ YANGI
// ============================================
function deleteVocabularyCard(word) {
  if (!confirm(`Delete "${word}" from your vocabulary list?`)) {
    return;
  }
  
  console.log('🗑️ Deleting vocabulary:', word);
  
  // ✅ REMOVE FROM DOM
  const card = document.querySelector(`[data-word="${word}"]`);
  if (card) {
    card.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => card.remove(), 300);
  }
  
  // ✅ REMOVE FROM ARTICLE VOCABULARY
  if (selectedArticle && selectedArticle.vocabulary) {
    selectedArticle.vocabulary = selectedArticle.vocabulary.filter(
      v => v.word.toLowerCase() !== word.toLowerCase()
    );
  }
  
  // ✅ REMOVE FROM LOCALSTORAGE
  removeCustomVocabulary(selectedArticle.id, word);
  
  console.log('✅ Vocabulary deleted');
}

// Add fadeOut animation to CSS (add this to your styles)
const style = document.createElement('style');
style.textContent = `
@keyframes fadeOut {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.9); }
}
`;
document.head.appendChild(style);
// ============================================
// SAVE CUSTOM VOCABULARY - ✅ YANGI
// ============================================
function saveCustomVocabulary(articleId, vocab) {
  let customVocab = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_VOCABULARY) || {};
  
  if (!customVocab[articleId]) {
    customVocab[articleId] = [];
  }
  
  // Check if already exists
  const exists = customVocab[articleId].some(
    v => v.word.toLowerCase() === vocab.word.toLowerCase()
  );
  
  if (!exists) {
    customVocab[articleId].push(vocab);
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_VOCABULARY, customVocab);
    console.log('💾 Custom vocabulary saved');
  }
}

// ============================================
// REMOVE CUSTOM VOCABULARY - ✅ YANGI
// ============================================
function removeCustomVocabulary(articleId, word) {
  let customVocab = loadFromLocalStorage(STORAGE_KEYS.CUSTOM_VOCABULARY) || {};
  
  if (customVocab[articleId]) {
    customVocab[articleId] = customVocab[articleId].filter(
      v => v.word.toLowerCase() !== word.toLowerCase()
    );
    
    if (customVocab[articleId].length === 0) {
      delete customVocab[articleId];
    }
    
    saveToLocalStorage(STORAGE_KEYS.CUSTOM_VOCABULARY, customVocab);
    console.log('💾 Custom vocabulary removed from storage');
  }
}
// ============================================
// SUBMIT SUMMARY - ✅ FIXED WITH WORD COUNT
// ============================================
async function submitSummary() {
  // ✅ SO'Z SONINI TEKSHIRISH
  const words = userSummary.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  if (wordCount < 50) {
    alert(`⚠️ Please write at least 50 words for your summary!\n\nYou have written: ${wordCount} words`);
    return;
  }
  
  const btn = document.getElementById('submitSummaryBtn');
  const feedbackDisplay = document.getElementById('summaryFeedbackDisplay');
  
  btn.disabled = true;
  btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Analyzing...';
  
  feedbackDisplay.style.display = 'block';
  feedbackDisplay.innerHTML = `
    <div class="feedback-loading">
      <div class="spinner-border text-primary" role="status"></div>
      <p>🤖 AI is analyzing your summary...</p>
    </div>
  `;
  
  try {
    console.log('📤 Sending summary:', {
      wordCount,
      summaryLength: userSummary.length,
      articleTitle: selectedArticle.title
    });
    
    const response = await fetch(`${ARTICLE_API_URL}/article-summary`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        article: selectedArticle.content.substring(0, 2000),
        userSummary: userSummary,
        language: selectedArticleLanguage,
        articleTitle: selectedArticle.title
      })
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server error:', errorText);
      throw new Error(`Server error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ Data received:', data);
    
    if (data.success && data.feedback) {
      displaySummaryFeedback(data.feedback, data.score || 75);
      
      if (typeof trackToolUsage === 'function') {
        trackToolUsage('article');
      }
      
      if (typeof addRecentActivity === 'function') {
        addRecentActivity('Reading Article', data.score || 85, '📖', '#3b82f6');
      }
      
      if (typeof incrementStat === 'function') {
        incrementStat('totalStudyTime', 5);
      }
      
      console.log('✅ Summary feedback complete!');
    } else {
      throw new Error('No feedback received from server');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    feedbackDisplay.innerHTML = `
      <div class="feedback-error">
        <i class="bi bi-exclamation-triangle"></i>
        <p><strong>Error:</strong> ${error.message}</p>
        <button onclick="submitSummary()" class="retry-btn">
          <i class="bi bi-arrow-clockwise"></i> Try Again
        </button>
      </div>
    `;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="bi bi-magic"></i> Get AI Feedback';
  }
}

// ============================================
// DISPLAY SUMMARY FEEDBACK
// ============================================
function displaySummaryFeedback(feedback, score) {
  const feedbackDisplay = document.getElementById('summaryFeedbackDisplay');
  
  let emoji = '🎉', scoreColor = '#10b981', message = 'Excellent!';
  
  if (score >= 90) { emoji = '🏆'; scoreColor = '#10b981'; message = 'Outstanding!'; }
  else if (score >= 80) { emoji = '⭐'; scoreColor = '#3b82f6'; message = 'Great job!'; }
  else if (score >= 70) { emoji = '👍'; scoreColor = '#f59e0b'; message = 'Good work!'; }
  else if (score >= 60) { emoji = '💪'; scoreColor = '#ef4444'; message = 'Keep trying!'; }
  else { emoji = '📚'; scoreColor = '#6b7280'; message = 'Practice more!'; }
  
  feedbackDisplay.innerHTML = `
    <div class="summary-feedback">
      <div class="feedback-header">
        <div class="feedback-icon" style="background: ${scoreColor}20;">
          ${emoji}
        </div>
        <div class="feedback-title">
          <h3>AI Feedback</h3>
          <div class="feedback-score" style="color: ${scoreColor}">
            <strong>${score}/100</strong>
            <span>${message}</span>
          </div>
        </div>
      </div>
      
      <div class="feedback-content">
        ${feedback}
      </div>
      
      <div class="feedback-actions">
        <button onclick="resetSummary()" class="reset-summary-btn">
          <i class="bi bi-arrow-clockwise"></i>
          Write Another Summary
        </button>
        <button onclick="backToArticlesList()" class="back-to-list-btn">
          <i class="bi bi-arrow-left"></i>
          Back to Articles
        </button>
      </div>
    </div>
  `;
  
  if (score >= 90 && typeof createConfetti === 'function') {
    createConfetti();
  }
  
  setTimeout(() => {
    feedbackDisplay.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 300);
}

// ============================================
// UPDATE SUMMARY VALUE - ✅ WITH AUTO-SAVE
// ============================================
function updateSummaryValue(value) {
  userSummary = value;
  
  // ✅ SAVE SUMMARY TO LOCALSTORAGE
  saveToLocalStorage(STORAGE_KEYS.USER_SUMMARY, value);
  
  const words = value.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  
  document.getElementById('summaryWordCount').textContent = wordCount;
  
  const submitBtn = document.getElementById('submitSummaryBtn');
  if (wordCount < 50) {
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.style.cursor = 'not-allowed';
  } else {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.style.cursor = 'pointer';
  }
}

function resetSummary() {
  userSummary = '';
  document.getElementById('articleSummaryInput').value = '';
  document.getElementById('summaryFeedbackDisplay').style.display = 'none';
  document.getElementById('summaryWordCount').textContent = '0';
  
  // ✅ Reset submit button
  const submitBtn = document.getElementById('submitSummaryBtn');
  submitBtn.disabled = true;
  submitBtn.style.opacity = '0.5';
}

// ============================================
// BACK TO ARTICLES LIST - ✅ CLEAR STATE
// ============================================
function backToArticlesList() {
  currentArticleView = 'list';
  selectedArticle = null;
  userSummary = '';
  highlightedText = '';
  
  // ✅ CLEAR LOCALSTORAGE
  clearArticleStorage();
  
  renderArticlesList();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  console.log('🔙 Returned to articles list, state cleared');
}

function changeArticleLanguage(lang) {
  selectedArticleLanguage = lang;
  console.log('🌐 Language changed to:', lang);
  
  if (currentArticleView === 'article' && selectedArticle) {
    const container = document.getElementById('vocabularyGridContainer');
    if (container && selectedArticle.vocabulary) {
      container.innerHTML = renderVocabularyCards(selectedArticle.vocabulary);
    }
  }
}

function getArticleLevelClass(level) {
  const classes = {
    'A1': 'level-a1', 'A2': 'level-a2',
    'B1': 'level-b1', 'B2': 'level-b2',
    'C1': 'level-c1', 'C2': 'level-c2'
  };
  return classes[level] || 'level-b1';
}

function showArticlesError(message) {
  const container = document.getElementById('articlesListContainer');
  if (container) {
    container.innerHTML = `
      <div class="articles-error">
        <i class="bi bi-exclamation-triangle"></i>
        <h3>Oops! Something went wrong</h3>
        <p>${message}</p>
        <button onclick="initArticles()" class="retry-btn">
          <i class="bi bi-arrow-clockwise"></i> Try Again
        </button>
      </div>
    `;
  }
}

function showArticlesTool() {
  console.log('📚 Articles tool activated');
  initArticles();
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================================
// GLOBAL EXPORTS - ✅ ADD NEW FUNCTIONS
// ============================================
window.showArticlesTool = showArticlesTool;
window.openArticle = openArticle;
window.backToArticlesList = backToArticlesList;
window.changeArticleLanguage = changeArticleLanguage;
window.updateSummaryValue = updateSummaryValue;
window.submitSummary = submitSummary;
window.resetSummary = resetSummary;
window.handleTextSelection = handleTextSelection;
window.highlightSelectedText = highlightSelectedText;
window.deleteVocabularyCard = deleteVocabularyCard; // ✅ YANGI

console.log('✅ Articles module loaded - Complete Fixed Version');