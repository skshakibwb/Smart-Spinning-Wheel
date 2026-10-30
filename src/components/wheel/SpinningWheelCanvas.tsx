/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { sound } from '../../lib/audio';
import { getAvatarColor, getInitials } from '../../lib/imageUtils';
import { Student } from '../../types';

interface SpinningWheelCanvasProps {
  students: Student[];
  onWinnerSelected: (student: Student) => void;
  disabled?: boolean;
  isSoundMuted?: boolean;
}

// Distinct, high-contrast pedagogical palette
const SLICE_COLORS = [
  '#2563EB', // Blue 600
  '#7C3AED', // Violet 600
  '#059669', // Emerald 600
  '#D97706', // Amber 600
  '#DC2626', // Red 600
  '#0891B2', // Cyan 600
  '#4F46E5', // Indigo 600
  '#DB2777', // Pink 600
  '#0D9488', // Teal 600
  '#EA580C', // Orange 600
  '#9333EA', // Purple 600
  '#16A34A', // Green 600
];

export const SpinningWheelCanvas: React.FC<SpinningWheelCanvasProps> = ({
  students,
  onWinnerSelected,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0); // in radians
  const [pointerFlap, setPointerFlap] = useState(0); // deflection angle for the flapper
  const animFrameId = useRef<number | null>(null);
  const lastTickSliceRef = useRef<number>(-1);

  // Pre-load images if students have photoUrl
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    students.forEach((student) => {
      if (student.photoUrl && !imageCacheRef.current.has(student.photoUrl)) {
        const img = new Image();
        img.src = student.photoUrl;
        img.onload = () => {
          imageCacheRef.current.set(student.photoUrl!, img);
          drawWheel(currentRotation);
        };
      }
    });
  }, [students]);

  // Main canvas drawing function
  const drawWheel = (angle: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 24;
    const innerRadius = 55;

    ctx.clearRect(0, 0, width, height);

    const count = students.length;
    if (count === 0) {
      // Empty state
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#1E293B';
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No eligible students in current round', centerX, centerY);
      ctx.restore();
      return;
    }

    const arc = (Math.PI * 2) / count;

    // 1. Draw outer decorative glow and rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius + 6, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // 2. Draw Wheel Slices
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    for (let i = 0; i < count; i++) {
      const student = students[i];
      const startAngle = i * arc;
      const endAngle = startAngle + arc;
      const sliceColor = SLICE_COLORS[i % SLICE_COLORS.length];

      // Slice sector
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sliceColor;
      ctx.fill();

      // Hairline divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Student content along the radius
      ctx.save();
      const textAngle = startAngle + arc / 2;
      ctx.rotate(textAngle);

      // Draw Avatar circle near the outer perimeter
      const avatarDistance = outerRadius - 40;
      const avatarSize = count > 14 ? 24 : 32;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarDistance, 0, avatarSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.clip();

      const cachedImg = student.photoUrl ? imageCacheRef.current.get(student.photoUrl) : null;
      if (cachedImg && cachedImg.complete) {
        ctx.drawImage(
          cachedImg,
          avatarDistance - avatarSize / 2,
          -avatarSize / 2,
          avatarSize,
          avatarSize
        );
      } else {
        const [bgCol] = getAvatarColor(student.name);
        ctx.fillStyle = bgCol;
        ctx.fillRect(
          avatarDistance - avatarSize / 2,
          -avatarSize / 2,
          avatarSize,
          avatarSize
        );
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `700 ${avatarSize > 26 ? '12px' : '10px'} "Plus Jakarta Sans", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(getInitials(student.name), avatarDistance, 1);
      }
      ctx.restore();

      // Student Name text
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      const fontSize = count > 18 ? 11 : count > 10 ? 13 : 15;
      ctx.font = `600 ${fontSize}px "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Truncate name if too long for slice
      let displayName = student.name;
      const maxTextWidth = outerRadius - innerRadius - (avatarSize + 30);
      if (ctx.measureText(displayName).width > maxTextWidth) {
        while (displayName.length > 3 && ctx.measureText(displayName + '…').width > maxTextWidth) {
          displayName = displayName.slice(0, -1);
        }
        displayName += '…';
      }

      ctx.fillText(displayName, avatarDistance - (avatarSize / 2 + 10), 0);

      ctx.restore();
    }

    ctx.restore();

    // 3. Draw Outer Gold/Chrome Rim Studs
    const studCount = Math.max(count * 2, 16);
    for (let s = 0; s < studCount; s++) {
      const studAngle = (s * (Math.PI * 2)) / studCount;
      const sx = centerX + Math.cos(studAngle) * (outerRadius + 3);
      const sy = centerY + Math.sin(studAngle) * (outerRadius + 3);
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#F8FAFC';
      ctx.fill();
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 4. Center Hub
    ctx.save();
    // Drop shadow under hub
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0F172A';
    ctx.fill();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.restore();

    // Center Hub Inner Ring & Spin Label
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius - 8, 0, Math.PI * 2);
    const hubGrad = ctx.createRadialGradient(
      centerX - 5,
      centerY - 5,
      5,
      centerX,
      centerY,
      innerRadius - 8
    );
    hubGrad.addColorStop(0, '#2563EB');
    hubGrad.addColorStop(1, '#1D4ED8');
    ctx.fillStyle = hubGrad;
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 17px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', centerX, centerY - 1);
    ctx.restore();

    // 5. Pointer at the TOP pointing downwards
    ctx.save();
    const pointerX = centerX;
    const pointerY = centerY - outerRadius - 4;

    ctx.translate(pointerX, pointerY);
    ctx.rotate(pointerFlap);

    // Realistic pointed flapper needle
    ctx.beginPath();
    ctx.moveTo(-16, -18);
    ctx.lineTo(16, -18);
    ctx.lineTo(0, 26); // points into wheel
    ctx.closePath();

    const needleGrad = ctx.createLinearGradient(-16, -18, 16, 26);
    needleGrad.addColorStop(0, '#EF4444');
    needleGrad.addColorStop(1, '#B91C1C');
    ctx.fillStyle = needleGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 3;
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Pivot pin
    ctx.beginPath();
    ctx.arc(0, -10, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.restore();
  };

  // Redraw on prop / state change
  useEffect(() => {
    drawWheel(currentRotation);
  }, [students, currentRotation, pointerFlap]);

  // Handle spin execution
  const handleSpin = () => {
    if (isSpinning || disabled || students.length === 0) return;

    setIsSpinning(true);
    const count = students.length;
    const arc = (Math.PI * 2) / count;

    // Pick uniform fair random winner
    const winnerIndex = Math.floor(Math.random() * count);
    const winner = students[winnerIndex];

    // Compute angle so winner lands at top (angle 3pi/2)
    // Slice center angle for winnerIndex: (winnerIndex + 0.5) * arc
    // Angle at pointer: (currentAngle + sliceCenter) % 2pi = 3pi/2
    const sliceCenter = (winnerIndex + 0.5) * arc;
    const jitter = (Math.random() - 0.5) * (arc * 0.55); // Organic non-center landing

    // Min 6 full rotations (12pi) + target alignment
    const minRotations = 6 + Math.floor(Math.random() * 3);
    const currentNorm = ((currentRotation % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const targetOffset = (1.5 * Math.PI - (sliceCenter + jitter) - currentNorm + Math.PI * 4) % (Math.PI * 2);
    const totalRotation = minRotations * Math.PI * 2 + targetOffset;

    const startAngle = currentRotation;
    const finalAngle = startAngle + totalRotation;
    const duration = 5200; // 5.2 seconds
    const startTime = performance.now();

    // Cubic easing out
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3.2);

    let lastAngle = startAngle;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);

      const angleNow = startAngle + totalRotation * eased;
      setCurrentRotation(angleNow);

      // Velocity ratio for audio tick pitch
      const deltaAngle = angleNow - lastAngle;
      lastAngle = angleNow;
      const velocityRatio = Math.min(deltaAngle * 30, 2);

      // Check slice boundary crossing for ticker sound & flapper deflection
      const pointerNormalized = ((1.5 * Math.PI - angleNow) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const currentSlice = Math.floor(pointerNormalized / arc);

      if (currentSlice !== lastTickSliceRef.current) {
        lastTickSliceRef.current = currentSlice;
        sound.playTickSound(velocityRatio);
        setPointerFlap(Math.min(0.25, deltaAngle * 2.5));
      } else {
        // Return pointer to neutral position
        setPointerFlap((prev) => prev * 0.85);
      }

      if (progress < 1) {
        animFrameId.current = requestAnimationFrame(animate);
      } else {
        // Spin finished
        setCurrentRotation(finalAngle);
        setPointerFlap(0);
        setIsSpinning(false);
        sound.playWinFanfare();
        onWinnerSelected(winner);
      }
    };

    animFrameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Canvas Wheel */}
      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={560}
          height={560}
          className="max-w-full h-auto drop-shadow-2xl select-none"
        />

        {/* Clickable Center Hub Trigger */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || disabled || students.length === 0}
          className={`absolute inset-0 m-auto w-24 h-24 rounded-full flex flex-col items-center justify-center text-white font-bold transition-transform cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-400 ${
            isSpinning
              ? 'opacity-80 scale-95 cursor-not-allowed'
              : 'hover:scale-105 active:scale-95'
          }`}
          aria-label="Spin Wheel"
        >
          {/* Transparent overlay over the drawn hub */}
        </button>
      </div>

      {/* Main Wheel Action Trigger Bar */}
      <div className="mt-6 flex items-center gap-4">
        <button
          onClick={handleSpin}
          disabled={isSpinning || disabled || students.length === 0}
          className={`px-8 py-3.5 rounded-xl font-bold text-base uppercase tracking-wider text-white shadow-xl transition-all flex items-center gap-2 cursor-pointer ${
            isSpinning || disabled || students.length === 0
              ? 'bg-slate-500 opacity-60 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          {isSpinning ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Spinning…</span>
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>SPIN THE WHEEL</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
