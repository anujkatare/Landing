import React, { Suspense, useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Environment, Html, useScroll, ScrollControls, Scroll } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Menu, X, ArrowUpRight, Github, Twitter, Youtube, Send } from 'lucide-react'
import redBullModel from './models/redbull_energy_drink.glb?url'

gsap.registerPlugin(ScrollTrigger)

// --- 3D Components ---

function RedBullCan() {
  const group = useRef()
  // Loading from src/models using the Vite-resolved URL
  const { scene } = useGLTF(redBullModel)

  // Mouse follow state
  const mouseX = useRef(0)
  const mouseY = useRef(0)

  useEffect(() => {
    const onMouseMove = (e) => {
      mouseX.current = (e.clientX / window.innerWidth - 0.5) * 2
      mouseY.current = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)
    return () => window.removeEventListener('mousemove', onMouseMove)
  }, [])

  useFrame((state) => {
    if (!group.current) return
    const targetX = mouseX.current * 0.3
    const targetY = mouseY.current * 0.2
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetX, 0.05)
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetY, 0.05)

    // Add the floating effect to a base position
    const time = state.clock.getElapsedTime()
    group.current.position.y = -2 + Math.sin(time * 1.5) * 0.1
  })

  if (scene) {
    return <primitive ref={group} object={scene} scale={12} position={[2, -1, 0]} />
  }

  return (
    <mesh ref={group} position={[0, -2, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 2.2, 32]} />
      <meshStandardMaterial
        color="#ffffff"
        metalness={1}
        roughness={0.1}
        emissive="#001e3d"
        emissiveIntensity={0.2}
      />
    </mesh>
  )
}

function Scene({ view = 'home' }) {
  const { camera } = useThree()
  const scroll = useScroll()
  const group = useRef()

  useFrame(() => {
    if (view === 'newsletter') {
      // Smoothly drift the can to the right when showing the newsletter
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 2.5, 0.05)
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.PI * 0.2, 0.05) // Subtle angle
      return
    }

    // Standard Landing Page Transformations
    const r1 = scroll.range(0, 1 / 3)
    const r2 = scroll.range(1 / 3, 1 / 3)

    // Position transformations
    group.current.position.x = THREE.MathUtils.lerp(0, -6, r1)
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, 1, r2)

    group.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI + 2, r1)
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, Math.PI * 2, r2)
  })

  return (
    <group ref={group}>
      <Suspense fallback={null}>
        <RedBullCan />
      </Suspense>
      <Environment preset="studio" intensity={1} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow />
      <directionalLight position={[-5, 5, 5]} intensity={1} color="#ffcc00" />
    </group>
  )
}

// --- UI Components ---

const Navbar = ({ onNewsletterClick, view }) => (
  <nav className="fixed top-0 left-0 w-full z-50 p-8 flex justify-between items-center bg-transparent">
    <div className="flex items-center gap-4 cursor-pointer" onClick={() => onNewsletterClick(false)}>
      <div className="w-12 h-12 bg-white rounded-full overflow-hidden flex items-center justify-center border-2 border-[#db0a40] shadow-lg shadow-red-600/20">
        <img
          src="https://w7.pngwing.com/pngs/1006/924/png-transparent-red-bull-energy-drink-illustration-red-bull-racing-energy-drink-monster-energy-red-bull-mammal-food-text-thumbnail.png"
          alt="Red Bull Logo"
          className="w-8 h-auto"
        />
      </div>
      <div className="text-2xl font-black uppercase tracking-tighter text-white">RED BULL</div>
    </div>
    <div className="hidden md:flex gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
      <span className="hover:text-red-500 cursor-pointer transition-colors" onClick={() => onNewsletterClick(false)}>The Can</span>
      <span className="hover:text-red-500 cursor-pointer transition-colors" onClick={() => onNewsletterClick(false)}>Athletes</span>
      <span className="hover:text-red-500 cursor-pointer transition-colors" onClick={() => onNewsletterClick(false)}>Events</span>
      <span className="hover:text-red-500 cursor-pointer transition-colors">Shop</span>
    </div>
    <button
      onClick={() => onNewsletterClick(view === 'home')}
      className={`px-6 py-2 border-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${view === 'newsletter' ? 'bg-white text-black border-white' : 'border-white/20 text-white hover:bg-white hover:text-black'}`}>
      {view === 'newsletter' ? 'Back' : 'Newsletter'}
    </button>
  </nav>
)

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <div className="h-screen w-full flex items-center justify-center p-6 relative z-30">
      <div className="max-w-md w-full bg-[#001e3d]/80 backdrop-blur-2xl border border-white/10 p-12 rounded-2xl shadow-2xl">
        {!submitted ? (
          <>
            <h2 className="text-4xl font-black text-white uppercase italic mb-2 tracking-tighter">Stay <span className="text-[#db0a40]">Ignited.</span></h2>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-8">Join the inner circle. Get the latest wings in your inbox.</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-black tracking-widest text-[#ffcc00]">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@energy.com"
                  className="w-full bg-white/5 border border-white/10 p-4 text-white rounded-lg focus:outline-none focus:border-[#db0a40] transition-colors"
                />
              </div>
              <button className="w-full py-4 bg-[#db0a40] text-white font-black uppercase italic tracking-widest rounded-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-colors">
                Subscribe <Send size={16} />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-10 scale-in-center">
            <div className="w-16 h-16 bg-[#ffcc00] rounded-full flex items-center justify-center mx-auto mb-6">
              <ArrowUpRight className="text-black transform rotate-45" size={32} />
            </div>
            <h3 className="text-3xl font-black text-white uppercase italic mb-2">Check Your Inbox!</h3>
            <p className="text-white/40 text-sm">Welcome to the world of Red Bull.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const Section = ({ children, className = "" }) => (
  <section className={`h-screen w-full flex flex-col justify-center px-12 md:px-24 relative z-10 ${className}`}>
    {children}
  </section>
)

export default function App() {
  const [view, setView] = useState('home') // 'home' or 'newsletter'

  return (
    <div className="relative w-full h-screen bg-[#001e3d] overflow-hidden">
      <Navbar onNewsletterClick={(val) => setView(val ? 'newsletter' : 'home')} view={view} />

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden transition-all duration-700">
        {view === 'newsletter' ? (
          <div className="absolute inset-x-0 top-0 h-[400%] flex flex-wrap gap-x-12 gap-y-6 opacity-[0.03] rotate-[-10deg] scale-150 animate-vertical-scroll">
            {Array.from({ length: 300 }).map((_, i) => (
              <span key={i} className={`text-6xl font-black uppercase italic whitespace-nowrap ${i % 2 === 0 ? 'text-white' : 'text-[#db0a40]'}`}>
                Red Bull Gives You Wings •
              </span>
            ))}
          </div>
        ) : (
          <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[40rem] font-black text-white/5 select-none animate-pulse">RB</h1>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes vertical-scroll {
          0% { transform: translateY(0) rotate(-10deg); }
          100% { transform: translateY(-50%) rotate(-10deg); }
        }
        .animate-vertical-scroll {
          animation: vertical-scroll 10s linear infinite;
        }
      `}} />

      {/* 3D Visuals */}
      <div className="fixed inset-0 pointer-events-none z-10">
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
          <Suspense fallback={<Html center><div className="text-[#ffcc00] font-black text-3xl italic uppercase tracking-tighter animate-pulse">Powering Up...</div></Html>}>
            <ScrollControls pages={view === 'newsletter' ? 1 : 3} damping={0.2} enabled={view === 'home'}>
              <Scene view={view} />

              <Scroll html className="w-full">
                {view === 'newsletter' ? (
                  <div className="h-screen w-full flex items-center justify-start px-24 md:px-48">
                    <Newsletter />
                  </div>
                ) : (
                  <>
                    <Section>
                      <div className="max-w-4xl">
                        <p className="text-[#ffcc00] font-black uppercase tracking-[0.5em] mb-4">Vitalizes Body & Mind</p>
                        <h1 className="text-9xl font-black uppercase leading-[0.8] tracking-tighter text-white mb-8">
                          Gives You <br /> <span className="text-[#db0a40]">Wings.</span>
                        </h1>
                        <div className="flex gap-4">
                          <a
                            href="https://blinkit.com/s/?q=red%20bull"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-10 py-5 bg-[#db0a40] text-white font-black uppercase italic tracking-widest rounded-sm hover:scale-105 transition-transform shadow-xl shadow-red-900/40 inline-flex items-center justify-center cursor-pointer"
                          >
                            Buy Now
                          </a>
                        </div>
                      </div>
                    </Section>

                    <Section className="items-end">
                      <div className="max-w-2xl text-right">
                        <h2 className="text-7xl font-black uppercase mb-6 leading-none text-white italic">Pure <span className="text-[#ffcc00]">Energy.</span></h2>
                        <p className="text-xl text-white/60 mb-8 font-medium leading-relaxed max-w-lg ml-auto">
                          Whether you're reaching for new heights, or diving into the unknown, Red Bull gives you the fuel to push boundaries.
                        </p>
                        <div className="flex flex-col gap-4 items-end">
                          <div className="p-6 bg-white/5 border-r-4 border-red-500 w-full max-sm">
                            <h4 className="font-black text-white uppercase tracking-widest mb-1 italic">Caffeine + Taurine</h4>
                            <p className="text-xs text-white/40 uppercase">The classic formula for peak performance.</p>
                          </div>
                          <div className="p-6 bg-white/5 border-r-4 border-[#ffcc00] w-full max-sm">
                            <h4 className="font-black text-white uppercase tracking-widest mb-1 italic">B-Group Vitamins</h4>
                            <p className="text-xs text-white/40 uppercase">Essential for energy metabolism.</p>
                          </div>
                        </div>
                      </div>
                    </Section>

                    <Section>
                      <div className="max-w-4xl flex flex-col items-center mx-auto text-center">
                        <h2 className="text-9xl font-black uppercase mb-12 text-white/10 tracking-tighter">Energy.</h2>
                        <div className="grid grid-cols-3 gap-12 w-full">
                          <div className="space-y-2">
                            <div className="text-5xl font-black text-white italic">80mg</div>
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Caffeine</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-5xl font-black text-white italic">250ml</div>
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Standard Can</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-5xl font-black text-white italic">∞</div>
                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Adrenaline</div>
                          </div>
                        </div>
                      </div>
                    </Section>
                  </>
                )}
              </Scroll>
            </ScrollControls>
          </Suspense>
        </Canvas>
      </div>

      {/* Social Links */}
      <div className="fixed bottom-10 right-10 flex gap-6 text-white/40 font-black text-[10px] uppercase tracking-widest pointer-events-auto">
        <span className="hover:text-white cursor-pointer transition-colors italic">Instagram</span>
        <span className="hover:text-white cursor-pointer transition-colors italic">TikTok</span>
        <span className="hover:text-white cursor-pointer transition-colors italic">Twitter</span>
      </div>
    </div>
  )
}
