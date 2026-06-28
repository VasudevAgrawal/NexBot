(function() {
  // Get bot ID from script tag
  var script = document.currentScript || (function() {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var botId = script.getAttribute('data-bot-id');
  if (!botId) { console.error('NexBot: data-bot-id is required'); return; }

  var NEXBOT_URL = 'https://nexchatai.netlify.app';

  // Inject styles
  var style = document.createElement('style');
  style.textContent = `
    #nexbot-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: linear-gradient(135deg, #7c6fff, #ff6b8a);
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(124,111,255,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999998;
      transition: transform 0.2s, box-shadow 0.2s;
      border: none;
      outline: none;
    }
    #nexbot-bubble:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 28px rgba(124,111,255,0.5);
    }
    #nexbot-bubble svg { width: 26px; height: 26px; }
    #nexbot-bubble .nexbot-close { display: none; }
    #nexbot-bubble.open .nexbot-chat-icon { display: none; }
    #nexbot-bubble.open .nexbot-close { display: block; }
    #nexbot-notification {
      position: fixed;
      bottom: 90px;
      right: 24px;
      background: #fff;
      border-radius: 12px;
      padding: 10px 16px;
      font-family: sans-serif;
      font-size: 13px;
      color: #333;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      z-index: 999997;
      display: flex;
      align-items: center;
      gap: 8px;
      animation: nexbot-pop 0.3s ease;
      cursor: pointer;
    }
    #nexbot-notification::after {
      content: '';
      position: absolute;
      bottom: -6px;
      right: 20px;
      width: 12px;
      height: 12px;
      background: #fff;
      transform: rotate(45deg);
      box-shadow: 2px 2px 4px rgba(0,0,0,0.06);
    }
    #nexbot-notification .nexbot-notif-close {
      margin-left: 8px;
      color: #aaa;
      font-size: 16px;
      cursor: pointer;
      line-height: 1;
    }
    #nexbot-iframe-wrap {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 370px;
      height: 560px;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 8px 40px rgba(0,0,0,0.18);
      z-index: 999999;
      display: none;
      border: none;
      animation: nexbot-slide 0.3s ease;
    }
    #nexbot-iframe-wrap.open { display: block; }
    #nexbot-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    @keyframes nexbot-pop {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes nexbot-slide {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @media (max-width: 480px) {
      #nexbot-iframe-wrap {
        width: calc(100vw - 16px);
        height: calc(100vh - 100px);
        bottom: 80px;
        right: 8px;
      }
    }
  `;
  document.head.appendChild(style);

  // Show notification bubble after 3 seconds
  setTimeout(function() {
    var notif = document.createElement('div');
    notif.id = 'nexbot-notification';
    notif.innerHTML = '👋 <span>Hi! Need help? Chat with us</span><span class="nexbot-notif-close" onclick="this.parentElement.remove()">×</span>';
    notif.onclick = function(e) {
      if (!e.target.classList.contains('nexbot-notif-close')) openChat();
    };
    document.body.appendChild(notif);
    // Auto hide after 6 seconds
    setTimeout(function() { if(notif.parentElement) notif.remove(); }, 6000);
  }, 3000);

  // Create chat bubble
  var bubble = document.createElement('button');
  bubble.id = 'nexbot-bubble';
  bubble.setAttribute('aria-label', 'Open chat');
  bubble.innerHTML = `
    <svg class="nexbot-chat-icon" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
    <svg class="nexbot-close" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `;
  document.body.appendChild(bubble);

  // Create iframe container
  var iframeWrap = document.createElement('div');
  iframeWrap.id = 'nexbot-iframe-wrap';
  var iframe = document.createElement('iframe');
  iframe.id = 'nexbot-iframe';
  iframe.src = NEXBOT_URL + '/chat.html?bot=' + botId;
  iframe.setAttribute('allow', 'microphone');
  iframeWrap.appendChild(iframe);
  document.body.appendChild(iframeWrap);

  var isOpen = false;

  function openChat() {
    isOpen = true;
    iframeWrap.classList.add('open');
    bubble.classList.add('open');
    var notif = document.getElementById('nexbot-notification');
    if (notif) notif.remove();
  }

  function closeChat() {
    isOpen = false;
    iframeWrap.classList.remove('open');
    bubble.classList.remove('open');
  }

  bubble.onclick = function() {
    if (isOpen) closeChat(); else openChat();
  };

  // Listen for close message from iframe
  window.addEventListener('message', function(e) {
    if (e.data === 'nexbot-close') closeChat();
  });

})();
