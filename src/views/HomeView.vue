<script setup>
import { ref } from 'vue'

// Estado interactivo opcional para simular el Kiosk Demo / operador
const activeTab = ref('overview')
const ticketNumber = ref('A-104')
const counterNumber = ref('03')
const isCalling = ref(true)

const callNextTicket = () => {
  const nextNum = parseInt(ticketNumber.value.replace('A-', '')) + 1
  ticketNumber.value = `A-${String(nextNum).padStart(3, '0')}`
}
</script>

<template>
  <div class="min-h-screen bg-[#f8f9ff] text-slate-900 font-sans antialiased selection:bg-[#002d62] selection:text-white">
    <!-- Top Navigation Bar -->
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <!-- Brand Logo -->
         
        <div class="flex items-center gap-3 cursor-pointer">
          <img 
              src="@/assets/zenticket-logo.svg" 
              alt="Zenticket Logo" 
              class="h-9 w-auto group-hover:scale-105 transition-transform"
            />
          <!--
          <div class="w-10 h-10 rounded-xl bg-[#002d62] flex items-center justify-center text-white shadow-md shadow-[#002d62]/20">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path>
            </svg>
          </div>
          <span class="text-xl font-black tracking-tight text-[#002d62]">ZenTicket</span>
        -->
          
        </div>

        <!-- Navigation Links -->
        <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#capabilities" class="hover:text-[#002d62] transition-colors">Capabilities</a>
          <a href="#architecture" class="hover:text-[#002d62] transition-colors">Architecture</a>
          <a href="#pros-considerations" class="hover:text-[#002d62] transition-colors">Pros & Considerations</a>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          <a href="/register" class="text-sm font-semibold text-slate-700 hover:text-[#002d62] transition-colors px-4 py-2">Register</a>
          <a href="/login" class="bg-[#002d62] hover:bg-[#001f44] text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-[#002d62]/20 transition-all flex items-center gap-2">
            Login
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </a>
        </div>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-white to-[#f8f9ff]">
      <div class="max-w-7xl mx-auto px-6 text-center">
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#eff4ff] border border-[#cbdbf5] text-[#002d62] text-xs font-semibold mb-8">
          <span class="w-2 h-2 rounded-full bg-[#002d62] animate-pulse"></span>
          INTELLIGENT QUEUE AUTOMATION • REAL-TIME ENGINE
        </div>

        <h1 class="text-5xl md:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-[1.15] mb-6">
          Revolutionize your customer service with <span class="text-[#002d62]">real-time queue management</span>
        </h1>

        <p class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          Eliminate physical waiting lines, streamline branch traffic, and empower staff with instant sub-millisecond WebSocket synchronization across touch kiosks, waiting room TV displays, and operator counters.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a href="#architecture" class="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 font-semibold px-8 py-4 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-3">
            Explore Operator Desk
          </a>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-8 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-16">
          <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span> Zero installation required</div>
          <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span> Enterprise SLA 99.99%</div>
          <div class="flex items-center gap-2"><span class="text-emerald-600 font-bold">✓</span> Multi-tenant ready</div>
        </div>

        <!-- Live Kiosk & Telemetry Preview Card -->
        <div class="max-w-6xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 md:p-8 text-left">
          <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500"></span>
              <span class="w-3 h-3 rounded-full bg-amber-500"></span>
              <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span class="text-xs font-mono text-slate-400 ml-2">00:50</span>
            </div>
            <div class="flex items-center gap-3 text-xs font-mono text-slate-500">
              <span class="text-emerald-600 font-bold flex items-center gap-1">⚡ WS 2.4ms</span>
              <span>Sync Hash: 8F49-A1</span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Dispatch Box -->
            <div class="bg-[#eff4ff] rounded-2xl p-6 border border-[#cbdbf5]">
              <div class="flex justify-between items-center mb-4">
                <span class="text-xs font-bold uppercase tracking-wider text-[#002d62]">Display Dispatch</span>
                <span class="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse">● CALLING</span>
              </div>
              <div class="text-5xl font-black text-[#002d62] tracking-tight mb-2">{{ ticketNumber }}</div>
              <div class="text-sm font-bold text-slate-700">Counter {{ counterNumber }} • Customer Support</div>
              <div class="text-xs text-slate-500 mt-1">Assigned Operator: Sarah Jenkins</div>
              <div class="mt-6 pt-4 border-t border-[#cbdbf5] flex justify-between text-xs text-slate-500 font-mono">
                <span>Elapsed Time</span>
                <span class="font-bold text-slate-700">00:42</span>
              </div>
            </div>

            <!-- Telemetry Box -->
            <div class="bg-white rounded-2xl p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <div class="flex justify-between items-center mb-4">
                  <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Queue Telemetry</span>
                  <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                </div>
                <div class="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div class="text-xs text-slate-500">In Queue</div>
                    <div class="text-2xl font-black text-slate-900">14</div>
                    <div class="text-[10px] text-emerald-600 font-semibold">+2 last 5m</div>
                  </div>
                  <div>
                    <div class="text-xs text-slate-500">Avg Wait</div>
                    <div class="text-2xl font-black text-slate-900">3.4m</div>
                    <div class="text-[10px] text-emerald-600 font-semibold">-35% SLA</div>
                  </div>
                </div>
              </div>
              <div>
                <div class="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                  <span>Customer CSAT</span>
                  <span class="text-[#002d62]">98.4%</span>
                </div>
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div class="bg-[#002d62] h-full rounded-full w-[98.4%]"></div>
                </div>
              </div>
            </div>

            <!-- Kiosk Terminal 01 -->
            <div class="bg-white rounded-2xl p-6 border border-slate-200">
              <div class="flex justify-between items-center mb-4">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Kiosk Terminal 01</span>
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <div class="text-sm font-bold text-slate-900 mb-3">Select Service</div>
              <div class="space-y-2">
                <button @click="ticketNumber = 'A-105'" class="w-full text-left px-4 py-3 rounded-xl bg-[#eff4ff] hover:bg-[#dfe9fc] border border-[#cbdbf5] text-xs font-bold text-[#002d62] flex items-center justify-between transition-colors">
                  <span>A General Inquiry</span>
                  <span>›</span>
                </button>
                <button @click="ticketNumber = 'V-201'" class="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors">
                  <span>B VIP Priority Banking</span>
                  <span>›</span>
                </button>
                <button @click="ticketNumber = 'C-302'" class="w-full text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 flex items-center justify-between transition-colors">
                  <span>C Account Opening</span>
                  <span>›</span>
                </button>
              </div>
              <div class="text-[10px] text-slate-400 mt-3 text-center">Touch to dispense ticket or scan digital wallet</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Value Proposition Section -->
    <section id="architecture" class="py-24 bg-white border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-xs font-bold uppercase tracking-widest text-[#002d62] mb-3 block">Value Proposition</span>
          <h2 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Centralized Flow Architecture Engineered for High-Volume Facilities</h2>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#002d62] flex items-center justify-center shrink-0 font-bold">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 mb-1">Multi-Branch Synchronization</h3>
                <p class="text-sm text-slate-600 leading-relaxed">Centralizes customer traffic across multiple regional branches in real-time with centralized administrative rules and telemetry tracking.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#002d62] flex items-center justify-center shrink-0 font-bold">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 mb-1">Automated Dispatching Engine</h3>
                <p class="text-sm text-slate-600 leading-relaxed">Algorithmic routing with custom SLA thresholds, VIP prioritization, customer transfer mechanisms, and dynamic desk re-balancing.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#002d62] flex items-center justify-center shrink-0 font-bold">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 mb-1">Bottleneck Detection</h3>
                <p class="text-sm text-slate-600 leading-relaxed">Continuous telemetry tracks agent idle times, resolution velocity, and proactively alerts managers when queue volumes spike.</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-[#eff4ff] text-[#002d62] flex items-center justify-center shrink-0 font-bold">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div>
                <h3 class="text-lg font-bold text-slate-900 mb-1">Sub-Millisecond Event Bus</h3>
                <p class="text-sm text-slate-600 leading-relaxed">WebSocket bus seamlessly synchronizes kiosk thermal printers, lobby smart TVs, and mobile SMS queues without delay.</p>
              </div>
            </div>
          </div>

          <!-- Architecture Visual Card -->
          <div class="bg-[#f8f9ff] rounded-3xl p-8 border border-[#cbdbf5]">
            <div class="flex justify-between items-center mb-6">
              <span class="text-xs font-mono font-bold text-[#002d62]">REAL-TIME TRAFFIC BUS</span>
              <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">● STREAM HEALTHY</span>
            </div>
            <div class="bg-white rounded-2xl p-6 border border-slate-200 mb-6 text-center shadow-inner">
              <div class="text-sm font-bold text-slate-800 mb-4">ZenBus Cluster &lt; 15ms Latency</div>
              <div class="text-xs text-slate-500">Connected Nodes: 1,428 active devices</div>
            </div>
            <div class="flex justify-between items-center text-xs font-mono text-slate-500">
              <span>Network Overhead:</span>
              <span class="font-bold text-slate-700">0.4 KB / transaction payload</span>
            </div>
          </div>
        </div>

        <!-- Metrics Bar -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-slate-100">
          <div class="text-center">
            <div class="text-4xl font-black text-[#002d62] mb-1">58%</div>
            <div class="text-xs font-semibold text-slate-500 uppercase">Wait Time Reduction</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-[#002d62] mb-1">&lt; 15ms</div>
            <div class="text-xs font-semibold text-slate-500 uppercase">Event Broadcast</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-[#002d62] mb-1">100k+</div>
            <div class="text-xs font-semibold text-slate-500 uppercase">Daily Tickets Processed</div>
          </div>
          <div class="text-center">
            <div class="text-4xl font-black text-[#002d62] mb-1">4.9 / 5</div>
            <div class="text-xs font-semibold text-slate-500 uppercase">Operator Rating</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Capabilities Grid -->
    <section id="capabilities" class="py-24 bg-[#f8f9ff] border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-xs font-bold uppercase tracking-widest text-[#002d62] mb-3 block">PLATFORM MODULES</span>
          <h2 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Engineered for Every Operational Touchpoint</h2>
          <p class="text-slate-600 mt-2">Hardware-agnostic components designed to integrate frictionlessly across physical and digital front-desks.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Card 1 -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#002d62] flex items-center justify-center font-bold mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-3">Public Touch Kiosk</h3>
              <p class="text-sm text-slate-600 leading-relaxed mb-6">Fast self-service ticket issuance by service area with short-code prefixes, multi-language prompts, and instant thermal ticket / QR generation.</p>
            </div>
            <ul class="space-y-2.5 text-xs font-medium text-slate-700 pt-4 border-t border-slate-100">
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> Area prefixes (A, B, C)</li>
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> VIP priority tagging</li>
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> On-screen localized guidance</li>
            </ul>
          </div>

          <!-- Card 2 -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#002d62] flex items-center justify-center font-bold mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-3">Real-Time TV Displays</h3>
              <p class="text-sm text-slate-600 leading-relaxed mb-6">Waiting room TV monitors synchronized via WebSockets with audible chime alerts, animated counter directions, and multilingual announcement audio.</p>
            </div>
            <ul class="space-y-2.5 text-xs font-medium text-slate-700 pt-4 border-t border-slate-100">
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> Zero-lag WebSocket bus</li>
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> Custom layout branding</li>
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> Split-screen ticker & media</li>
            </ul>
          </div>

          <!-- Card 3 -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#002d62] flex items-center justify-center font-bold mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-3">Ergonomic Operator Panel</h3>
              <p class="text-sm text-slate-600 leading-relaxed mb-6">Streamlined console for bank tellers and service agents to call next tickets, recall no-shows, transfer between departments, and log resolution metrics.</p>
            </div>
            <ul class="space-y-2.5 text-xs font-medium text-slate-700 pt-4 border-t border-slate-100">
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> 1-click 'Call Next' hotkeys</li>
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> Inter-department ticket transfer</li>
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> Resolution tags & audit notes</li>
            </ul>
          </div>

          <!-- Card 4 -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-2xl bg-[#eff4ff] text-[#002d62] flex items-center justify-center font-bold mb-6">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 mb-3">Centralized Admin</h3>
              <p class="text-sm text-slate-600 leading-relaxed mb-6">Multi-tenant control over branches, service counters, role-based access, automated queue balancing, and downloadable compliance audit trails.</p>
            </div>
            <ul class="space-y-2.5 text-xs font-medium text-slate-700 pt-4 border-t border-slate-100">
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> Role-based permissions</li>
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> Branch-level SLA triggers</li>
              <li class="flex items-center gap-2"><span class="text-emerald-600">✓</span> Historical CSV / REST API sync</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Pros & Considerations Section -->
    <section id="pros-considerations" class="py-24 bg-white border-t border-slate-200">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-xs font-bold uppercase tracking-widest text-[#002d62] mb-3 block">TRANSPARENT EVALUATION</span>
          <h2 class="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Pros & Operational Considerations</h2>
          <p class="text-slate-600 mt-2">An objective assessment to help enterprise IT heads, operations directors, and branch managers plan their rollout.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Pros -->
          <div class="bg-[#f8f9ff] rounded-3xl p-8 border border-[#cbdbf5]">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">✓</div>
              <h3 class="text-lg font-bold text-slate-900">System Advantages (Pros)</h3>
            </div>
            <ul class="space-y-6">
              <li class="flex items-start gap-4">
                <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 mb-1">Operational Efficiency</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">Cut customer waiting bottlenecks by up to 58% through automated queue routing, intelligent pause management, and rapid agent recall.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 mb-1">Zero Physical Crowding</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">Eliminates disorganized reception lobbies with clear digital callouts, scheduled seating intervals, and mobile SMS/screen notifications.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 mb-1">Live Operational Metrics</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">Real-time visibility into operator idle times, average transaction speed (AHT), and peak hour customer influx across all regional sites.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">✓</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 mb-1">Multi-Tenant Scalability</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">Deploy seamlessly across 1 to 500+ branch locations with centralized policy distribution, custom tenant segmentation, and global oversight.</p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Considerations -->
          <div class="bg-white rounded-3xl p-8 border border-slate-200">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">ℹ</div>
              <h3 class="text-lg font-bold text-slate-900">Deployment Considerations</h3>
            </div>
            <ul class="space-y-6">
              <li class="flex items-start gap-4">
                <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">i</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 mb-1">Stable Network Infrastructure</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">Low-latency WebSocket connections required for instantaneous multi-screen syncing; fallback pollers operate automatically if dropped.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">i</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 mb-1">Dedicated Signage Hardware</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">Commercial Android, Smart TV displays, or compact HDMI media sticks recommended for lobby waiting zones and overhead monitors.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">i</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 mb-1">Brief Staff Onboarding</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">Standard 15-minute training for operators to master queue prioritization, transfer flows, resolution taxonomy, and hotkey shortcuts.</p>
                </div>
              </li>
              <li class="flex items-start gap-4">
                <span class="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">i</span>
                <div>
                  <h4 class="text-sm font-bold text-slate-900 mb-1">Kiosk Peripheral Integration</h4>
                  <p class="text-xs text-slate-600 leading-relaxed">Thermal ESC/POS printers required if physical paper tickets are preferred by your clientele over pure mobile QR e-tickets.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-slate-900 text-white py-16">
      <div class="max-w-7xl mx-auto px-6">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 pb-12 border-slate-800">
          <div class="flex items-center gap-3">
            
            <img 
              src="@/assets/logo.svg" 
              alt="Zenticket Logo" 
              class="h-9 w-auto group-hover:scale-105 transition-transform"
            />
            <span class="text-xl font-black tracking-tight text-white">ZenTicket</span>
          </div>
          <div class="flex items-center gap-6 text-sm text-slate-400">
            <a href="#capabilities" class="hover:text-white transition-colors">Capabilities</a>
            <a href="#architecture" class="hover:text-white transition-colors">Architecture</a>
            <a href="#pros-considerations" class="hover:text-white transition-colors">Pros & Considerations</a>
            <a href="#privacy" class="hover:text-white transition-colors">Privacy & Security</a>
          </div>
        </div>
        
      </div>
    </footer>
  </div>
</template>