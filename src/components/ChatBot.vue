<template>
  <div class="cb-wrapper">

    <!-- Bouton flottant -->
    <button class="cb-fab" @click="toggle" :class="{ open: isOpen }">
      <svg v-if="!isOpen" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M8 8V6a4 4 0 018 0v2"/><circle cx="9" cy="14" r="1.5" fill="#fff" stroke="none"/><circle cx="15" cy="14" r="1.5" fill="#fff" stroke="none"/><path d="M9 18h6"/></svg>
      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      <span v-if="unread > 0 && !isOpen" class="cb-badge">{{ unread }}</span>
    </button>

    <!-- Fenêtre -->
    <Transition name="cb-pop">
      <div v-if="isOpen" class="cb-window">

        <!-- Header -->
        <div class="cb-header">
          <div class="cb-header-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c5ce0" stroke-width="2" stroke-linecap="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M8 8V6a4 4 0 018 0v2"/><circle cx="9" cy="14" r="1.5" fill="#7c5ce0" stroke="none"/><circle cx="15" cy="14" r="1.5" fill="#7c5ce0" stroke="none"/><path d="M9 18h6"/></svg>
          </div>
          <div class="cb-header-info">
            <p class="cb-header-name">Assistant Traite</p>
            <div class="cb-header-status">
              <span class="cb-dot" :class="{ offline: aiError }"></span>
              <span>{{ aiError ? 'Hors ligne' : 'En ligne maintenant' }}</span>
            </div>
          </div>
          <div class="cb-header-actions">
            <button class="cb-head-btn" @click="clearChat" title="Effacer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
            </button>
            <button class="cb-head-btn" @click="toggle" title="Fermer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="cb-messages" ref="msgEl">

          <!-- Message de bienvenue -->
          <div class="cb-row bot">
            <div class="cb-sender-label">Assistant Traite</div>
            <div class="cb-row-inner">
              <div class="cb-bot-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M8 8V6a4 4 0 018 0v2"/><circle cx="9" cy="14" r="1.5" fill="#fff" stroke="none"/><circle cx="15" cy="14" r="1.5" fill="#fff" stroke="none"/></svg>
              </div>
              <div class="cb-bubble bot">
                Bonjour <strong>{{ userName }}</strong> ! Je connais toutes vos traites. Sur quoi puis-je vous aider ?
              </div>
            </div>
            <div class="cb-chips">
              <button
                v-for="chip in quickChips"
                :key="chip.label"
                class="cb-chip"
                @click="sendChip(chip.q)"
              >{{ chip.label }}</button>
            </div>
          </div>

          <!-- Historique messages -->
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="cb-row"
            :class="msg.role"
          >
            <div v-if="msg.role === 'assistant'" class="cb-sender-label">Assistant Traite</div>
            <div class="cb-row-inner" :class="{ 'justify-end': msg.role === 'user' }">
              <div v-if="msg.role === 'assistant'" class="cb-bot-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M8 8V6a4 4 0 018 0v2"/><circle cx="9" cy="14" r="1.5" fill="#fff" stroke="none"/><circle cx="15" cy="14" r="1.5" fill="#fff" stroke="none"/></svg>
              </div>
              <div class="cb-bubble" :class="msg.role" v-html="fmt(msg.content)"></div>
            </div>
            <div class="cb-time" :class="{ 'text-right': msg.role === 'user' }">{{ msg.time }}</div>
          </div>

          <!-- Typing indicator -->
          <div v-if="typing" class="cb-row bot">
            <div class="cb-row-inner">
              <div class="cb-bot-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"><rect x="3" y="8" width="18" height="12" rx="3"/><path d="M8 8V6a4 4 0 018 0v2"/><circle cx="9" cy="14" r="1.5" fill="#fff" stroke="none"/><circle cx="15" cy="14" r="1.5" fill="#fff" stroke="none"/></svg>
              </div>
              <div class="cb-bubble bot cb-typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer input -->
        <div class="cb-footer">
          <input
            ref="inputEl"
            v-model="inputText"
            class="cb-input"
            :placeholder="`Répondre à Assistant Traite…`"
            @keydown.enter.prevent="sendMessage"
            :disabled="typing"
          />
          <span class="cb-brand">par <strong>Traite App</strong></span>
          <button class="cb-send" @click="sendMessage" :disabled="!inputText.trim() || typing">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9" fill="#fff" stroke="none"/></svg>
          </button>
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const API = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const authStore = useAuthStore()
const userName  = computed(() => authStore.user?.prenom ?? 'vous')

interface Message {
  role: 'user' | 'assistant'
  content: string
  time: string
}

const isOpen        = ref(false)
const typing        = ref(false)
const aiError       = ref(false)
const unread        = ref(0)
const inputText     = ref('')
const messages      = ref<Message[]>([])
const currentConvId = ref<number | null>(null)
const msgEl         = ref<HTMLElement | null>(null)
const inputEl       = ref<HTMLInputElement | null>(null)

const quickChips = [
  { label: 'Ma trésorerie',    q: 'Quelle est ma trésorerie ?' },
  { label: 'Impayées',         q: 'Combien de traites impayées ?' },
  { label: 'Échéances',        q: 'Quelles sont mes échéances cette semaine ?' },
  { label: 'Analyse complète', q: 'Analyse ma situation financière' },
]

function now(): string {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function fmt(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>')
}

function scroll() {
  nextTick(() => {
    if (msgEl.value) msgEl.value.scrollTop = msgEl.value.scrollHeight
  })
}

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    unread.value = 0
    nextTick(() => inputEl.value?.focus())
  }
}

function clearChat() {
  messages.value      = []
  currentConvId.value = null
  aiError.value       = false
}

function token() { return localStorage.getItem('traity_token') }
function headers() {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token() ? { Authorization: `Bearer ${token()}` } : {}),
  }
}

async function sendChip(q: string) {
  inputText.value = q
  await sendMessage()
}

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || typing.value) return

  messages.value.push({ role: 'user', content: text, time: now() })
  inputText.value = ''
  typing.value    = true
  aiError.value   = false
  scroll()

  try {
    const res  = await fetch(`${API}/chatbot/chat`, {
      method:  'POST',
      headers: headers(),
      body:    JSON.stringify({
        message:         text,
        conversation_id: currentConvId.value,
      }),
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.message)

    if (!currentConvId.value) currentConvId.value = json.conversation_id

    messages.value.push({ role: 'assistant', content: json.reply, time: now() })
    if (!isOpen.value) unread.value++

  } catch {
    aiError.value = true
    messages.value.push({
      role:    'assistant',
      content: 'Je suis temporairement indisponible. Vérifiez qu\'Ollama est lancé (`ollama serve`).',
      time:    now(),
    })
  } finally {
    typing.value = false
    scroll()
  }
}
</script>

<style scoped>
/* ── Wrapper ─────────────────────────────────── */
.cb-wrapper {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
}

/* ── Bouton flottant ─────────────────────────── */
.cb-fab {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #7c5ce0;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(124, 92, 224, 0.4);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s;
  position: relative;
}
.cb-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(124, 92, 224, 0.55); }
.cb-fab.open  { background: #5f46b0; }

.cb-badge {
  position: absolute;
  top: -3px; right: -3px;
  background: #e74c3c;
  color: white;
  font-size: 10px;
  font-weight: 500;
  width: 17px; height: 17px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid white;
}

/* ── Fenêtre ─────────────────────────────────── */
.cb-window {
  position: absolute;
  bottom: 66px;
  right: 0;
  width: 340px;
  background: white;
  border-radius: 16px;
  border: 0.5px solid #e0ddf5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(124, 92, 224, 0.18);
}

/* ── Header ──────────────────────────────────── */
.cb-header {
  background: #7c5ce0;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.cb-header-avatar {
  width: 36px; height: 36px;
  border-radius: 50%;
  background: white;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cb-header-info { flex: 1; min-width: 0; }
.cb-header-name {
  color: white;
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}
.cb-header-status {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 2px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.85);
}
.cb-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #a8ff78;
  flex-shrink: 0;
}
.cb-dot.offline { background: #f39c12; }

.cb-header-actions { display: flex; gap: 6px; }
.cb-head-btn {
  width: 28px; height: 28px;
  background: rgba(255,255,255,0.15);
  border: none;
  border-radius: 8px;
  color: rgba(255,255,255,0.9);
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.15s;
}
.cb-head-btn:hover { background: rgba(255,255,255,0.28); }

/* ── Messages ────────────────────────────────── */
.cb-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #fafafa;
  max-height: 380px;
  scrollbar-width: thin;
  scrollbar-color: #e0ddf5 transparent;
}

.cb-row { display: flex; flex-direction: column; gap: 4px; }
.cb-row.bot  { align-items: flex-start; }
.cb-row.user { align-items: flex-end; }
.cb-row.assistant { align-items: flex-start; }

.cb-sender-label {
  font-size: 11px;
  color: #9a96b0;
  padding-left: 38px;
}
.cb-row-inner {
  display: flex;
  align-items: flex-end;
  gap: 8px;
}
.cb-row-inner.justify-end { justify-content: flex-end; }

.cb-bot-avatar {
  width: 28px; height: 28px;
  border-radius: 50%;
  background: #7c5ce0;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

/* Bulles */
.cb-bubble {
  padding: 10px 14px;
  font-size: 13px;
  line-height: 1.55;
  max-width: 220px;
  word-break: break-word;
}
.cb-bubble.bot,
.cb-bubble.assistant {
  background: white;
  border: 0.5px solid #e5e2f5;
  color: #2d2b3d;
  border-radius: 4px 16px 16px 16px;
}
.cb-bubble.user {
  background: #7c5ce0;
  color: white;
  border-radius: 16px 16px 4px 16px;
}

.cb-time {
  font-size: 10px;
  color: #b0aac8;
  padding: 0 2px;
}
.cb-time.text-right { text-align: right; }

/* Chips */
.cb-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding-left: 36px;
  margin-top: 4px;
}
.cb-chip {
  padding: 5px 14px;
  border-radius: 20px;
  border: 1.5px solid #7c5ce0;
  background: white;
  color: #7c5ce0;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
  font-family: inherit;
}
.cb-chip:hover { background: #7c5ce0; color: white; }

/* Typing dots */
.cb-typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px !important;
}
.cb-typing span {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: #b0aac8;
  animation: cbdot 1.2s infinite;
}
.cb-typing span:nth-child(2) { animation-delay: 0.2s; }
.cb-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes cbdot {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-5px); }
}

/* ── Footer ──────────────────────────────────── */
.cb-footer {
  border-top: 0.5px solid #ece9f5;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  flex-shrink: 0;
}
.cb-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 13px;
  color: #2d2b3d;
  background: transparent;
  font-family: inherit;
  min-width: 0;
}
.cb-input::placeholder { color: #b0aac8; }
.cb-input:disabled { opacity: 0.5; }

.cb-brand {
  font-size: 11px;
  color: #b0aac8;
  white-space: nowrap;
  flex-shrink: 0;
}
.cb-brand strong { color: #7c5ce0; }

.cb-send {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: #7c5ce0;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, transform 0.15s;
}
.cb-send:hover:not(:disabled) { background: #6b4ec8; transform: scale(1.05); }
.cb-send:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── Transition ──────────────────────────────── */
.cb-pop-enter-active { animation: cbpop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.cb-pop-leave-active { animation: cbpop 0.18s ease-in reverse; }
@keyframes cbpop {
  from { opacity: 0; transform: translateY(12px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Mobile ──────────────────────────────────── */
@media (max-width: 420px) {
  .cb-window { width: calc(100vw - 32px); right: -14px; }
}

/* ── Formatage markdown ──────────────────────── */
:deep(strong) { font-weight: 500; }
:deep(code) {
  background: #f0edff;
  color: #5f46b0;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 12px;
}
</style>