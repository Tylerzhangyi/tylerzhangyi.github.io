<template>
  <canvas
    ref="canvasRef"
    class="matrix-rain"
    :style="{ width: '100%', height: '100%' }"
  ></canvas>
</template>

<script>
export default {
  name: 'MatrixRain',
  data() {
    return {
      canvas: null,
      ctx: null,
      animationId: null,
      columns: [],
      fontSize: 18,
      columnWidth: 0,
      lastFrameTime: 0,
      frameInterval: 50 // 约20fps，进一步降低帧率提升性能
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCanvas()
      this.startAnimation()
    })
    window.addEventListener('resize', this.handleResize)
  },
  beforeUnmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
    window.removeEventListener('resize', this.handleResize)
  },
  methods: {
    initCanvas() {
      this.canvas = this.$refs.canvasRef
      if (!this.canvas) return

      this.ctx = this.canvas.getContext('2d')
      this.resizeCanvas()
      this.initColumns()
    },
    resizeCanvas() {
      if (!this.canvas) return

      const container = this.canvas.parentElement
      if (!container) return

      this.canvas.width = container.clientWidth
      this.canvas.height = container.clientHeight

      // 计算列数和列宽（增加列宽，减少列数，提升性能）
      this.columnWidth = this.fontSize * 1.5
      const columnCount = Math.floor(this.canvas.width / this.columnWidth)
      
      // 计算需要多少字符才能完全填满整个屏幕高度（无空隙，增加缓冲确保覆盖）
      const charsNeeded = Math.ceil(this.canvas.height / this.fontSize) + 10
      
      // 调整列数组大小
      if (this.columns.length !== columnCount) {
        this.columns = Array(columnCount).fill(null).map((_, i) => {
          // 为每个字符预计算颜色、大小和模糊值，减少运行时计算
          // 简化：使用固定的颜色和大小变化，减少计算
          const chars = Array(charsNeeded).fill(null).map((_, idx) => {
            const char = Math.random() > 0.5 ? '1' : '0'
            // 简化颜色：只使用3种主要颜色，减少变化
            const colorType = idx % 3
            let colorR, colorG, colorB, colorAlpha
            
            if (colorType === 0) {
              // 亮青蓝色
              colorR = 64
              colorG = 224
              colorB = 255
              colorAlpha = 0.9
            } else if (colorType === 1) {
              // 青绿色
              colorR = 72
              colorG = 209
              colorB = 204
              colorAlpha = 0.85
            } else {
              // 矢车菊蓝
              colorR = 100
              colorG = 149
              colorB = 237
              colorAlpha = 0.8
            }
            
            return {
              char,
              sizeVariation: 0.9 + (idx % 3) * 0.1, // 简化为3种大小
              colorR,
              colorG,
              colorB,
              colorAlpha
            }
          })
          
          return {
            x: i * this.columnWidth,
            y: 0, // 从屏幕顶部开始，确保填满
            speed: 1.0 + Math.random() * 2.0,
            length: charsNeeded,
            chars: chars
          }
        })
      } else {
        // 只更新 x 坐标，并确保列长度足够填满屏幕
        this.columns.forEach((col, i) => {
          col.x = i * this.columnWidth
          // 如果列长度不够，扩展它
          if (col.length < charsNeeded) {
            const additionalChars = Array(charsNeeded - col.length).fill(null).map((_, idx) => {
              const char = Math.random() > 0.5 ? '1' : '0'
              const colorType = (col.length + idx) % 3
              let colorR, colorG, colorB, colorAlpha
              
              if (colorType === 0) {
                colorR = 64
                colorG = 224
                colorB = 255
                colorAlpha = 0.9
              } else if (colorType === 1) {
                colorR = 72
                colorG = 209
                colorB = 204
                colorAlpha = 0.85
              } else {
                colorR = 100
                colorG = 149
                colorB = 237
                colorAlpha = 0.8
              }
              
              return {
                char,
                sizeVariation: 0.9 + ((col.length + idx) % 3) * 0.1,
                colorR,
                colorG,
                colorB,
                colorAlpha
              }
            })
            col.chars = [...col.chars, ...additionalChars]
            col.length = charsNeeded
          }
        })
      }
    },
    initColumns() {
      if (!this.canvas) return

      // 确保列宽已计算
      if (this.columnWidth === 0) {
        this.columnWidth = this.fontSize * 1.5
      }

      const columnCount = Math.floor(this.canvas.width / this.columnWidth)
      // 计算需要多少字符才能完全填满整个屏幕高度（无空隙，增加缓冲确保覆盖）
      const charsNeeded = Math.ceil(this.canvas.height / this.fontSize) + 10
      this.columns = Array(columnCount).fill(null).map((_, i) => {
        // 简化：使用固定的颜色和大小变化，减少计算
        const chars = Array(charsNeeded).fill(null).map((_, idx) => {
          const char = Math.random() > 0.5 ? '1' : '0'
          // 简化颜色：只使用3种主要颜色，减少变化
          const colorType = idx % 3
          let colorR, colorG, colorB, colorAlpha
          
          if (colorType === 0) {
            // 亮青蓝色
            colorR = 64
            colorG = 224
            colorB = 255
            colorAlpha = 0.9
          } else if (colorType === 1) {
            // 青绿色
            colorR = 72
            colorG = 209
            colorB = 204
            colorAlpha = 0.85
          } else {
            // 矢车菊蓝
            colorR = 100
            colorG = 149
            colorB = 237
            colorAlpha = 0.8
          }
          
          return {
            char,
            sizeVariation: 0.9 + (idx % 3) * 0.1, // 简化为3种大小
            colorR,
            colorG,
            colorB,
            colorAlpha
          }
        })
        
        return {
          x: i * this.columnWidth,
          y: 0, // 从屏幕顶部开始，确保填满
          speed: 1.0 + Math.random() * 2.0,
          length: charsNeeded,
          chars: chars
        }
      })
    },
    draw() {
      if (!this.canvas || !this.ctx) return

      // 绘制渐变背景（从浅蓝到深蓝黑色，匹配图片效果）
      const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height)
      gradient.addColorStop(0, 'rgba(15, 30, 60, 1)') // 浅蓝色顶部
      gradient.addColorStop(0.5, 'rgba(10, 20, 40, 1)') // 中等蓝色
      gradient.addColorStop(1, 'rgba(5, 10, 25, 1)') // 深蓝黑色底部
      this.ctx.fillStyle = gradient
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      // 移除拖尾效果，提升性能

      // 设置字体
      this.ctx.font = `bold ${this.fontSize}px 'Courier New', 'Monaco', 'Consolas', monospace`
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'top'

      // 先更新所有列的位置，确保滚动效果
      this.columns.forEach((column) => {
        // 更新列的位置
        column.y += column.speed

        // 无缝循环：使用模运算确保列位置始终在合理范围内
        // 当列移出屏幕底部时，循环到顶部，保持连续滚动
        const columnHeight = column.length * this.fontSize
        // 使用模运算实现无缝循环
        if (column.y >= columnHeight) {
          column.y = column.y % columnHeight
        }
        
        // 如果列在屏幕上方，也调整位置
        if (column.y < 0) {
          column.y = column.y + columnHeight
        }
      })

      // 然后绘制所有列
      this.columns.forEach((column) => {
        if (!column.chars || !Array.isArray(column.chars) || column.chars.length === 0) {
          return
        }

        // 移除字符变化，减少计算

        // 确保列的长度足够填满整个屏幕（无空隙，增加缓冲）
        const charsNeeded = Math.ceil(this.canvas.height / this.fontSize) + 15
        if (column.length < charsNeeded) {
          column.length = charsNeeded
          // 扩展字符数组，使用简化的数据结构
          const additionalChars = Array(charsNeeded - column.chars.length).fill(null).map((_, idx) => {
            const char = Math.random() > 0.5 ? '1' : '0'
            const colorType = (column.length + idx) % 3
            let colorR, colorG, colorB, colorAlpha
            
            if (colorType === 0) {
              colorR = 64
              colorG = 224
              colorB = 255
              colorAlpha = 0.9
            } else if (colorType === 1) {
              colorR = 72
              colorG = 209
              colorB = 204
              colorAlpha = 0.85
            } else {
              colorR = 100
              colorG = 149
              colorB = 237
              colorAlpha = 0.8
            }
            
            return {
              char,
              sizeVariation: 0.9 + ((column.length + idx) % 3) * 0.1,
              colorR,
              colorG,
              colorB,
              colorAlpha
            }
          })
          column.chars = [...column.chars, ...additionalChars]
        }

        // 绘制列中的每个字符（使用无缝循环，确保始终填满整个屏幕，无空隙）
        // 计算需要绘制多少个字符才能填满整个屏幕（从顶部到底部，增加缓冲确保无空隙）
        const charsToDraw = Math.ceil(this.canvas.height / this.fontSize) + 5
        
        // 批量设置字体和颜色，减少重复设置
        let lastFontSize = 0
        let lastColor = ''
        
        // 预计算字体大小分组，减少字体切换
        const fontSizeGroups = [0.9, 1.0, 1.1]
        let currentFontGroup = -1
        
        // 确保从屏幕顶部开始绘制，覆盖整个屏幕高度
        const startOffset = Math.floor(column.y / this.fontSize)
        const startY = column.y - startOffset * this.fontSize
        
        for (let i = 0; i < charsToDraw; i++) {
          // 计算实际 Y 坐标（从屏幕顶部开始，确保填满）
          const y = startY + i * this.fontSize
          
          // 如果字符超出屏幕范围，跳过
          if (y > this.canvas.height || y < -this.fontSize) continue

          // 使用模运算获取字符索引，实现无缝循环
          const charIndex = (startOffset + i + column.length) % column.length
          const charData = column.chars[charIndex]
          
          if (!charData) continue
          
          const char = charData.char || '0'

          // 简化字体大小：只使用3种大小，减少字体切换
          const sizeGroup = Math.floor(charData.sizeVariation * 3) % 3
          if (sizeGroup !== currentFontGroup) {
            const currentFontSize = this.fontSize * fontSizeGroups[sizeGroup]
            this.ctx.font = `bold ${currentFontSize}px 'Courier New', 'Monaco', 'Consolas', monospace`
            currentFontGroup = sizeGroup
            lastFontSize = currentFontSize
          }

          // 使用预计算的颜色，缓存颜色字符串减少重复计算
          const colorStr = `rgba(${charData.colorR}, ${charData.colorG}, ${charData.colorB}, ${charData.colorAlpha})`
          if (colorStr !== lastColor) {
            this.ctx.fillStyle = colorStr
            lastColor = colorStr
          }

          this.ctx.fillText(char, column.x + this.columnWidth / 2, y)
        }
      })

      // 在数字雨上方添加透明度0.6的黑色遮罩
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    },
    animate(currentTime) {
      // 使用时间节流，控制帧率
      if (!currentTime) {
        currentTime = performance.now()
      }
      
      const elapsed = currentTime - this.lastFrameTime
      
      if (elapsed >= this.frameInterval) {
        this.draw()
        this.lastFrameTime = currentTime
      }
      
      this.animationId = requestAnimationFrame((time) => this.animate(time))
    },
    startAnimation() {
      this.animate()
    },
    handleResize() {
      this.resizeCanvas()
    }
  }
}
</script>

<style scoped>
.matrix-rain {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}
</style>
