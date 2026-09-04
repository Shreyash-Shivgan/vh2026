import { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tier: number;
  life: number;
  maxLife: number;
  size: number;
  alive: boolean;
  targetNode: number;
}

interface Node {
  x: number;
  y: number;
  label: string;
  color: string;
  radius: number;
}

interface PipelineCanvasProps {
  surgeActive: boolean;
  ingestionRate: number;
}

const TIER_COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#6B7280'];

export default function PipelineCanvas({ surgeActive, ingestionRate }: PipelineCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastSpawnRef = useRef(0);
  const surgeRef = useRef(surgeActive);
  const rateRef = useRef(ingestionRate);

  surgeRef.current = surgeActive;
  rateRef.current = ingestionRate;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const getNodes = (): Node[] => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      return [
        { x: w * 0.08, y: h * 0.5, label: 'Ingestion', color: '#FF7700', radius: 22 },
        { x: w * 0.28, y: h * 0.5, label: 'Classifier', color: '#8B5CF6', radius: 20 },
        { x: w * 0.48, y: h * 0.18, label: 'P0', color: TIER_COLORS[0], radius: 14 },
        { x: w * 0.48, y: h * 0.39, label: 'P1', color: TIER_COLORS[1], radius: 14 },
        { x: w * 0.48, y: h * 0.61, label: 'P2', color: TIER_COLORS[2], radius: 14 },
        { x: w * 0.48, y: h * 0.82, label: 'P3', color: TIER_COLORS[3], radius: 14 },
        { x: w * 0.68, y: h * 0.5, label: 'FlowMind', color: '#8B5CF6', radius: 24 },
        { x: w * 0.88, y: h * 0.3, label: 'Worker A', color: '#10B981', radius: 16 },
        { x: w * 0.88, y: h * 0.5, label: 'Worker B', color: '#10B981', radius: 16 },
        { x: w * 0.88, y: h * 0.7, label: 'Worker C', color: '#10B981', radius: 16 },
      ];
    };

    const spawnParticle = () => {
      const nodes = getNodes();
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      const surge = surgeRef.current;

      // Tier distribution: P0 21%, P1 34%, P2 30%, P3 15%
      const r = Math.random();
      let tier = 0;
      if (r < 0.21) tier = 0;
      else if (r < 0.55) tier = 1;
      else if (r < 0.85) tier = 2;
      else tier = 3;

      // Under surge, more P3 particles (logs)
      if (surge && Math.random() < 0.35) tier = 3;

      const startNode = nodes[0];
      particlesRef.current.push({
        x: startNode.x,
        y: startNode.y + (Math.random() - 0.5) * 20,
        vx: 0,
        vy: 0,
        tier,
        life: 0,
        maxLife: 300,
        size: surge ? 2.5 + Math.random() * 2 : 2 + Math.random() * 1.5,
        alive: true,
        targetNode: 1,
      });
    };

    const animate = (time: number) => {
      const w = canvas.width / window.devicePixelRatio;
      const h = canvas.height / window.devicePixelRatio;
      const nodes = getNodes();

      // Clear with subtle trail
      ctx.fillStyle = 'rgba(9, 13, 22, 0.25)';
      ctx.fillRect(0, 0, w, h);

      // Draw connections
      ctx.strokeStyle = 'rgba(40, 42, 49, 0.4)';
      ctx.lineWidth = 1;
      const connections: [number, number][] = [
        [0, 1], [1, 2], [1, 3], [1, 4], [1, 5],
        [2, 6], [3, 6], [4, 6], [5, 6],
        [6, 7], [6, 8], [6, 9],
      ];
      connections.forEach(([a, b]) => {
        ctx.beginPath();
        ctx.moveTo(nodes[a].x, nodes[a].y);
        ctx.lineTo(nodes[b].x, nodes[b].y);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((node, i) => {
        const isFlowMind = i === 6;
        const isIngestion = i === 0;
        const pulse = Math.sin(time * 0.002 + i) * 0.15 + 0.85;

        // Glow
        const glowRadius = node.radius * 2.5 * pulse;
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowRadius);
        const baseColor = node.color;
      grad.addColorStop(0, baseColor + '40');
      grad.addColorStop(1, baseColor + '00');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Node body
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner dot
      ctx.fillStyle = node.color;
      ctx.globalAlpha = pulse;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Label
      ctx.fillStyle = '#6B7280';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      const labelY = i === 2 || i === 3 || i === 4 || i === 5 ? node.y - node.radius - 6 : node.y + node.radius + 14;
      ctx.fillText(node.label, node.x, labelY);
      });

      // Spawn particles
      const spawnRate = surgeRef.current ? 8 : 40; // ms between spawns
      if (time - lastSpawnRef.current > spawnRate) {
        const count = surgeRef.current ? 3 : 1;
        for (let i = 0; i < count; i++) spawnParticle();
        lastSpawnRef.current = time;
      }

      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (!p.alive) {
          particles.splice(i, 1);
          continue;
        }

        // Route: 0 -> 1 -> tierNode(2-5) -> 6(FlowMind) -> worker(7-9)
        const nodes = getNodes();
        let target: Node;
        if (p.targetNode === 1) {
          target = nodes[1];
        } else if (p.targetNode === 2) {
          target = nodes[2 + p.tier]; // tier node
        } else if (p.targetNode === 3) {
          target = nodes[6]; // FlowMind
        } else if (p.targetNode === 4) {
          // Route to worker based on tier
          const workerIdx = 7 + (p.tier % 3);
          target = nodes[workerIdx];
        } else {
          p.alive = false;
          continue;
        }

        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 5) {
          p.targetNode++;
          if (p.targetNode > 4) {
            p.alive = false;
            continue;
          }
        }

        const speed = surgeRef.current ? 3.5 : 2;
        p.vx = (dx / dist) * speed;
        p.vy = (dy / dist) * speed;
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        // Draw particle with glow
        const color = TIER_COLORS[p.tier];
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Cap particle count
      if (particles.length > 500) {
        particles.splice(0, particles.length - 500);
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
