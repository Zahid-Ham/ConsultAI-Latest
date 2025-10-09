// frontend/src/components/landing/FeatureRing3D.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FEATURES } from "./featureData";
import { useAuthContext } from "../../contexts/AuthContext"; // ✅ Import your Auth Context
import "./featureRing3D.css";

export default function FeatureRing3D({ features = FEATURES }) {
  const navigate = useNavigate();
  const { user } = useAuthContext(); // ✅ Get the logged-in user from context

  const stageRef = useRef(null);
  const wrapRef = useRef(null);

  const count = features.length;
  const step = 360 / count;
  const sensitivity = 0.28;

  const [rotation, setRotation] = useState(0);
  const [radius, setRadius] = useState(300);

  const dragRef = useRef({
    isDown: false,
    startX: 0,
    lastX: 0,
    velocity: 0,
  });
  const rafRef = useRef(null);

  // ResizeObserver → dynamic radius
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const r = Math.max(140, Math.min(420, Math.floor(w * 0.36)));
        setRadius(r);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Normalize angles
  const norm = (d) => {
    let x = d % 360;
    if (x < -180) x += 360;
    if (x > 180) x -= 360;
    return x;
  };

  // --- Pointer handling ---
  const handlePointerDown = (clientX) => {
    cancelInertia();
    dragRef.current.isDown = true;
    dragRef.current.startX = clientX;
    dragRef.current.lastX = clientX;
    dragRef.current.velocity = 0;
    stageRef.current?.classList.add("interacting");
  };

  const handlePointerMove = (clientX) => {
    if (!dragRef.current.isDown) return;
    const dx = clientX - dragRef.current.lastX;
    dragRef.current.lastX = clientX;
    dragRef.current.velocity = dx * 0.6 + dragRef.current.velocity * 0.4;
    setRotation((r) => r + dx * sensitivity);
  };

  const handlePointerUp = () => {
    if (!dragRef.current.isDown) return;
    dragRef.current.isDown = false;

    const v = dragRef.current.velocity * sensitivity;
    if (Math.abs(v) > 0.2) {
      startInertia(v);
    } else {
      stageRef.current?.classList.remove("interacting");
    }
  };

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onMouseDown = (e) => handlePointerDown(e.clientX);
    const onMouseMove = (e) => handlePointerMove(e.clientX);
    const onMouseUp = () => handlePointerUp();

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const onTouchStart = (e) => handlePointerDown(e.touches[0].clientX);
    const onTouchMove = (e) => handlePointerMove(e.touches[0].clientX);
    const onTouchEnd = () => handlePointerUp();

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      el.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  // --- Inertia ---
  const startInertia = (initialVel) => {
    let v = initialVel;
    const friction = 0.92;

    const stepFn = () => {
      setRotation((r) => r + v);
      v *= friction;
      if (Math.abs(v) > 0.02) {
        rafRef.current = requestAnimationFrame(stepFn);
      } else {
        rafRef.current = null;
        stageRef.current?.classList.remove("interacting");
      }
    };
    rafRef.current = requestAnimationFrame(stepFn);
  };

  const cancelInertia = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // --- Navigation ---
  const goNext = () => {
    cancelInertia();
    stageRef.current?.classList.remove("interacting");
    setRotation((r) => r - step);
  };

  const goPrev = () => {
    cancelInertia();
    stageRef.current?.classList.remove("interacting");
    setRotation((r) => r + step);
  };

  const goToIndex = (i) => {
    cancelInertia();
    const target = -i * step;
    stageRef.current?.classList.remove("interacting");
    setRotation(target);
  };

  // Which card is front
  const frontIndex = useMemo(() => {
    const k = Math.round(-rotation / step) % count;
    return ((k % count) + count) % count;
  }, [rotation, step, count]);

  // --- Cards ---
  const cards = features.map((f, i) => {
    const angle = i * step + rotation;
    const angleRad = (angle * Math.PI) / 180;
    const near = (Math.cos(angleRad) + 1) / 2;
    const scale = 0.8 + 0.35 * near;
    const opacity = 0.25 + 0.75 * near;
    const zIndex = Math.round(100 + 200 * near);

    const transform = `translate(-50%,-50%) rotateY(${angle}deg) translateZ(${radius}px) rotateY(${-angle}deg) scale(${scale})`;

    return {
      ...f,
      style: {
        transform,
        zIndex,
        opacity,
        background: `linear-gradient(135deg, ${f.colorFrom}, ${f.colorTo})`,
      },
      isFront: Math.abs(norm(i * step + rotation)) < step / 2,
      index: i,
    };
  });

  useEffect(() => {
    return () => cancelInertia();
  }, []);

  return (
    <div className="feature-carousel-wrap">
      <div className="feature-carousel" ref={wrapRef} aria-label="Feature carousel">
        <div className="carousel-stage interacting" ref={stageRef}>
          {cards.map((c) => (
            <div
              key={c.id}
              className={`carousel-card ${c.isFront ? "front" : ""}`}
              style={c.style}
              role="group"
              aria-label={c.title}
            >
              <div className="card-face">
                <div>
                  <div className="card-emoji" aria-hidden>
                    {c.emoji}
                  </div>
                  <div className="card-title">{c.title}</div>
                </div>
                <div className="card-blurb">{c.blurb}</div>
                <div>
                  <button
                    className="card-cta"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Route logic based on feature id
                      if (!user) {
                        navigate("/login");
                        return;
                      }
                      switch (c.id) {
                        case "find-doctor":
                          navigate("/chat");
                          break;
                        case "ai-chat":
                          navigate("/chat/ai");
                          break;
                        case "records":
                          navigate("/medical-report-upload");
                          break;
                        case "security":
                          navigate("/medical-report-upload"); // Secure & Private → report upload
                          break;
                        case "availability":
                          navigate("/chat"); // 24/7 → doctor/patient chat
                          break;
                        default:
                          navigate("/");
                      }
                    }}
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button className="carousel-nav-btn left" onClick={goPrev}>
          ❮
        </button>
        <button className="carousel-nav-btn right" onClick={goNext}>
          ❯
        </button>

        {/* Dots */}
        <div className="carousel-dots">
          {features.map((f, i) => (
            <div
              key={f.id}
              className={`carousel-dot ${i === frontIndex ? "active" : ""}`}
              onClick={() => goToIndex(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
