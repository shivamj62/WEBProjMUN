"use client";
import React, { useMemo, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const BackgroundRippleEffect = ({
  cellSize = 56,
}) => {
  const [clickedCell, setClickedCell] = useState(null);
  const [rippleKey, setRippleKey] = useState(0);
  const [gridDimensions, setGridDimensions] = useState({ rows: 8, cols: 27 });
  const containerRef = useRef(null);

  // Calculate grid dimensions based on container size
  useEffect(() => {
    const updateGridDimensions = () => {
      if (containerRef.current && typeof window !== 'undefined') {
        const { offsetWidth, offsetHeight } = containerRef.current;
        const cols = Math.ceil(offsetWidth / cellSize) + 2; // Add extra columns for coverage
        const rows = Math.ceil(offsetHeight / cellSize) + 2; // Add extra rows for coverage
        setGridDimensions({ rows, cols });
      }
    };

    if (typeof window !== 'undefined') {
      updateGridDimensions();
      window.addEventListener('resize', updateGridDimensions);
      
      // Update on zoom level changes
      const timer = setInterval(updateGridDimensions, 1000);
      
      return () => {
        window.removeEventListener('resize', updateGridDimensions);
        clearInterval(timer);
      };
    }
  }, [cellSize]);

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full z-0">
      <DivGrid
        key={`base-${rippleKey}`}
        rows={gridDimensions.rows}
        cols={gridDimensions.cols}
        cellSize={cellSize}
        clickedCell={clickedCell}
        onCellClick={(row, col) => {
          setClickedCell({ row, col });
          setRippleKey((k) => k + 1);
          setTimeout(() => setClickedCell(null), 2000);
        }}
      />
    </div>
  );
};

const DivGrid = ({
  rows = 7,
  cols = 30,
  cellSize = 56,
  clickedCell = null,
  onCellClick = () => {},
}) => {
  const cells = useMemo(
    () => Array.from({ length: rows * cols }, (_, idx) => idx),
    [rows, cols],
  );

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
    width: cols * cellSize,
    height: rows * cellSize,
    position: "absolute",
    top: 0,
    left: 0,
    minWidth: '100%',
    minHeight: '100%',
  };

  return (
    <div className="relative overflow-hidden w-full h-full">
      <div style={gridStyle}>
        {cells.map((idx) => {
          const rowIdx = Math.floor(idx / cols);
          const colIdx = idx % cols;
          const distance = clickedCell
            ? Math.hypot(clickedCell.row - rowIdx, clickedCell.col - colIdx)
            : 0;
          const delay = clickedCell ? Math.max(0, distance * 55) : 0;
          const duration = 200 + distance * 80;

          const style = clickedCell
            ? {
                "--delay": `${delay}ms`,
                "--duration": `${duration}ms`,
              }
            : {};

          return (
            <div
              key={idx}
              className={cn(
                "relative border border-white/20 bg-transparent opacity-30 transition-all duration-200 cursor-pointer hover:opacity-80 hover:bg-white/10",
                clickedCell && "animate-cell-ripple"
              )}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                ...style,
              }}
              onClick={() => onCellClick(rowIdx, colIdx)}
            />
          );
        })}
      </div>
    </div>
  );
};
