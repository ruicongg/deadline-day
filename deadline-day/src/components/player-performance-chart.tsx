"use client"

import { useEffect, useRef } from "react"

export function PlayerPerformanceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Data for radar chart
    const data = {
      labels: ["Goals", "Assists", "Pass Accuracy", "Shots", "Dribbles", "Key Passes"],
      datasets: [
        {
          label: "Current Season",
          data: [85, 78, 89, 75, 92, 87],
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          borderColor: "rgba(99, 102, 241, 1)",
          borderWidth: 2,
        },
        {
          label: "League Average",
          data: [65, 59, 70, 62, 56, 55],
          backgroundColor: "rgba(156, 163, 175, 0.2)",
          borderColor: "rgba(156, 163, 175, 1)",
          borderWidth: 2,
        },
      ],
    }

    // Draw radar chart
    drawRadarChart(ctx, data, canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.4)

    // Handle window resize
    const handleResize = () => {
      if (!canvasRef.current) return

      canvasRef.current.width = canvasRef.current.offsetWidth
      canvasRef.current.height = canvasRef.current.offsetHeight

      if (ctx) {
        drawRadarChart(
          ctx,
          data,
          canvasRef.current.width / 2,
          canvasRef.current.height / 2,
          Math.min(canvasRef.current.width, canvasRef.current.height) * 0.4,
        )
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Function to draw radar chart
  const drawRadarChart = (
    ctx: CanvasRenderingContext2D,
    data: any,
    centerX: number,
    centerY: number,
    radius: number,
  ) => {
    const numPoints = data.labels.length
    const angleStep = (Math.PI * 2) / numPoints

    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    // Draw axis lines and labels
    ctx.strokeStyle = "rgba(203, 213, 225, 0.5)"
    ctx.fillStyle = "rgba(100, 116, 139, 0.8)"
    ctx.font = "12px sans-serif"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"

    for (let i = 0; i < numPoints; i++) {
      const angle = i * angleStep - Math.PI / 2
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)

      // Draw axis line
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      // Draw label
      const labelX = centerX + (radius + 20) * Math.cos(angle)
      const labelY = centerY + (radius + 20) * Math.sin(angle)
      ctx.fillText(data.labels[i], labelX, labelY)
    }

    // Draw concentric circles
    for (let r = radius / 5; r <= radius; r += radius / 5) {
      ctx.beginPath()
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2)
      ctx.strokeStyle = "rgba(203, 213, 225, 0.3)"
      ctx.stroke()
    }

    // Draw datasets
    data.datasets.forEach((dataset: any, datasetIndex: number) => {
      ctx.beginPath()

      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2
        const value = dataset.data[i] / 100 // Normalize to 0-1
        const x = centerX + radius * value * Math.cos(angle)
        const y = centerY + radius * value * Math.sin(angle)

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.closePath()
      ctx.fillStyle = dataset.backgroundColor
      ctx.fill()
      ctx.strokeStyle = dataset.borderColor
      ctx.lineWidth = dataset.borderWidth
      ctx.stroke()

      // Draw data points
      for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep - Math.PI / 2
        const value = dataset.data[i] / 100
        const x = centerX + radius * value * Math.cos(angle)
        const y = centerY + radius * value * Math.sin(angle)

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = dataset.borderColor
        ctx.fill()
      }
    })

    // Draw legend
    const legendY = centerY + radius + 50
    data.datasets.forEach((dataset: any, index: number) => {
      const legendX = centerX - radius + index * 200

      ctx.fillStyle = dataset.borderColor
      ctx.fillRect(legendX, legendY, 15, 15)

      ctx.fillStyle = "rgba(100, 116, 139, 0.8)"
      ctx.textAlign = "left"
      ctx.fillText(dataset.label, legendX + 20, legendY + 7)
    })
  }

  return <canvas ref={canvasRef} className="w-full h-full" />
}

