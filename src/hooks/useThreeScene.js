import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { ExtrudeGeometry } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import state from '../state'
import { GRID_COLS } from '../config'
import RadialRGBShiftShader from '../shaders/RadialRGBShiftShader'

// useThreeScene wires the Three.js scene to a <canvas> ref.
// It returns actionsRef, an object of imperative methods (navClick, zoomTo,
// unzoom) that both the animation loop and React UI buttons can call.
export function useThreeScene(canvasRef, setUiState, portfolios, scrollDisabledRef) {
  const actionsRef = useRef({})

  useEffect(() => {
    if (!canvasRef.current) return
    if (!portfolios) return

    // --- Core setup ---
    state.W = window.innerWidth
    state.H = window.innerHeight
    const isMobile = state.W < 768
    const GAP = isMobile ? 20 : 80
    state.cellW = state.W + GAP
    state.cellH = state.H + GAP

    state.targetZoomVal = state.W > state.H ? 1.5 : 1.6
    state.animatedZoom = state.targetZoomVal

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      stencil: true,
    })
    renderer.setSize(state.W, state.H)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 1)

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(
      -state.W / 2, state.W / 2,
      state.H / 2, -state.H / 2,
      -10000, 10000
    )
    camera.position.z = 1500

    // --- Post-processing ---
    const target = new THREE.WebGLRenderTarget(state.W, state.H, {
      type: THREE.HalfFloatType,
      stencilBuffer: true,
    })
    const composer = new EffectComposer(renderer, target)
    composer.addPass(new RenderPass(scene, camera))
    const shaderPass = new ShaderPass(RadialRGBShiftShader)
    // --- Mouse proximity effect uniforms (non-touch only) ---
    shaderPass.uniforms.mousePos.value = new THREE.Vector2(0.5, 0.5)
    shaderPass.uniforms.resolution.value = new THREE.Vector2(state.W, state.H)
    if (!state.isTouchDevice) shaderPass.uniforms.mouseAmount.value = 1.0
    composer.addPass(shaderPass)
    composer.addPass(new OutputPass())

    const items = []
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2(-10, -10)

    // --- Actions (called by React UI buttons and by the raycaster click handler) ---
    actionsRef.current.navClick = (colIndex) => {
      if (state.isZoomed) actionsRef.current.unzoom()

      state.currentActiveCol = colIndex
      setUiState(s => ({ ...s, activeCol: colIndex, menuOpen: false }))

      const currentGx = Math.round(state.targetX / state.cellW)
      let bestGx = currentGx
      let minDiff = Infinity

      for (let i = currentGx - 3; i <= currentGx + 3; i++) {
        const physCol = ((i + Math.floor(PHYS_COLS / 2)) % PHYS_COLS + PHYS_COLS) % PHYS_COLS
        const checkLocalX = physCol % GRID_COLS
        if (checkLocalX === colIndex) {
          const diff = Math.abs(i - currentGx)
          if (diff < minDiff) { minDiff = diff; bestGx = i }
        }
      }

      const currentGy = Math.round(-state.targetY / state.cellH)
      const colRows = portfolios[colIndex].length
      const bestGy = Math.round(currentGy / colRows) * colRows
      state.targetX = bestGx * state.cellW
      state.targetY = -bestGy * state.cellH
    }

    actionsRef.current.zoomTo = (x, y, itemData) => {
      state.isZoomed = true
      state.preZoomTargetX = state.targetX
      state.preZoomTargetY = state.targetY
      state.targetX = x
      state.targetY = y
      state.targetZoomVal = 0.99
      state.targetEffectIntensity = 0.0
      state.targetLetterRotation = Math.PI / 4
      state.targetMouseX = 0
      state.targetMouseY = 0

      setUiState(s => ({ ...s, isZoomed: true, menuOpen: false }))
      setTimeout(() => {
        setUiState(s => ({ ...s, activeProject: itemData ?? null }))
      }, 900)
    }

    actionsRef.current.unzoom = () => {
      state.isZoomed = false
      state.targetX = state.preZoomTargetX
      state.targetY = state.preZoomTargetY
      state.targetZoomVal = state.W > state.H ? 1.5 : 1.6
      state.targetEffectIntensity = 1.0
      state.targetLetterRotation = 0

      setUiState(s => ({ ...s, isZoomed: false, activeProject: null }))
    }

    // --- Texture loader ---
    const loadTexture = (itemData) => {
      return new Promise(resolve => {
        new THREE.TextureLoader().load(itemData.image, (t) => {
          t.colorSpace = THREE.SRGBColorSpace
          resolve({ tex: t, imgW: t.image.width, imgH: t.image.height })
        })
      })
    }

    // --- Build scene grid ---
    // PHYS_COLS is always ≥ 3 so there are always items left + center + right on screen.
    // Physical slots map to logical columns via physCol % GRID_COLS.
    const PHYS_COLS = GRID_COLS < 3 ? 3 : GRID_COLS

    const wrapTitle = (title, maxChars = 12) => {
      const words = title.split(/\s+/)
      const lines = []
      let current = ''
      for (const word of words) {
        if (!current) {
          current = word
        } else if ((current + ' ' + word).length <= maxChars) {
          current += ' ' + word
        } else {
          lines.push(current)
          current = word
        }
      }
      if (current) lines.push(current)
      return lines
    }

    new FontLoader().load(
      'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json',
      (font) => {
        let stencilCounter = 0

        for (let physCol = 0; physCol < PHYS_COLS; physCol++) {
          const col = physCol % GRID_COLS
          const colItems = portfolios[col]
          const colRows = colItems.length
          const gx = physCol - Math.floor(PHYS_COLS / 2)

          for (let row = 0; row < colRows; row++) {
            stencilCounter++
            const gy = row - Math.floor(colRows / 2)
            const itemData = colItems[row]

            const group = new THREE.Group()
            group.position.set(gx * state.cellW, -gy * state.cellH, 0)
            scene.add(group)

            const stencilId = stencilCounter

            // Base plane — writes into the stencil buffer so each cell clips its own texture
            const baseGeo = new THREE.PlaneGeometry(1, 1)
            const baseMat = new THREE.MeshBasicMaterial({
              color: 0x111111,
              stencilWrite: true,
              stencilRef: stencilId,
              stencilFunc: THREE.AlwaysStencilFunc,
              stencilZPass: THREE.ReplaceStencilOp,
            })
            const baseMesh = new THREE.Mesh(baseGeo, baseMat)
            baseMesh.scale.set(state.W, state.H, 1)
            group.add(baseMesh)

            const planes = { R: null, G: null, B: null }

            // Load texture then create three additive colour planes (R/G/B split effect)
            loadTexture(itemData).then(texData => {
              baseMat.color.setHex(0x000000)
              const matOpts = {
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false,
                stencilWrite: true,
                stencilRef: stencilId,
                stencilFunc: THREE.EqualStencilFunc,
              }

              planes.R = new THREE.Mesh(baseGeo, new THREE.MeshBasicMaterial({ map: texData.tex, color: 0xff0000, ...matOpts }))
              planes.R.position.z = 1
              group.add(planes.R)

              planes.G = new THREE.Mesh(baseGeo, new THREE.MeshBasicMaterial({ map: texData.tex, color: 0x00ff00, ...matOpts }))
              planes.G.position.z = 2
              group.add(planes.G)

              planes.B = new THREE.Mesh(baseGeo, new THREE.MeshBasicMaterial({ map: texData.tex, color: 0x0000ff, ...matOpts }))
              planes.B.position.z = 3
              group.add(planes.B)

              itemObj.texData = texData
            })

            // 3D extruded text
            const textGroup = new THREE.Group()
            textGroup.position.z = 50
            group.add(textGroup)

            const lines = wrapTitle(itemData.title.toUpperCase())
            const lineHeight = 1.3
            const letterSpacing = 0.08
            const textMeshes = []

            lines.forEach((line, lineIndex) => {
              let currentX = 0
              const lineItems = []

              for (let j = 0; j < line.length; j++) {
                const char = line[j]
                if (char === ' ') { currentX += 0.4; continue }

                const shapes = font.generateShapes(char, 1)
                const textGeo = new ExtrudeGeometry(shapes, { depth: 0.2, bevelEnabled: false, curveSegments: 12 })
                textGeo.computeBoundingBox()
                const bBox = textGeo.boundingBox
                const charWidth = bBox.max.x - bBox.min.x
                textGeo.translate(
                  -0.5 * (bBox.max.x + bBox.min.x),
                  -0.5 * (bBox.max.y + bBox.min.y),
                  -0.5 * (bBox.max.z + bBox.min.z)
                )

                let customKerning = 0
                if (j < line.length - 1) {
                  const nextChar = line[j + 1]
                  if ((char === 'T' && nextChar === 'A') || (char === 'A' && nextChar === 'T') ||
                      (char === 'O' && nextChar === 'X') || (char === 'Y' && nextChar === 'O')) customKerning = -0.16
                  if (char === 'C' && nextChar === 'A') customKerning = -0.13
                  if (char === 'B' && nextChar === 'O') customKerning = -0.09
                }

                const mesh = new THREE.Mesh(
                  textGeo,
                  new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide })
                )
                mesh.position.set(currentX + charWidth / 2, -(lineIndex * lineHeight), 0)
                textGroup.add(mesh)
                lineItems.push({ mesh, x: currentX + charWidth / 2 })
                textMeshes.push(mesh)
                currentX += charWidth + letterSpacing + customKerning
              }

              lineItems.forEach(li => li.mesh.position.x -= currentX / 2)
            })

            textGroup.children.forEach(mesh => {
              mesh.position.y += (lines.length - 1) * lineHeight / 2
            })

            const itemObj = {
              group, baseMesh, planes, textGroup, textMeshes,
              gx, gy, colIndex: col, data: itemData, texData: null,
              hoverScale: 1.0, isHovered: false,
              colRows,
            }
            items.push(itemObj)
          }
        }

        setTimeout(() => setUiState(s => ({ ...s, loading: false })), 2000)
      }
    )

    // --- Input event handlers ---
    let lastPointerY

    const handleWheel = (e) => {
      if (state.isZoomed || scrollDisabledRef?.current) return
      state.targetY -= e.deltaY * (state.isTouchDevice ? 2.0 : 1.0)
      state.lastInputTime = Date.now()
    }

    const handlePointerDown = (e) => {
      if (e.target.closest && e.target.closest('.ui-element')) return
      if (scrollDisabledRef?.current) return
      state.isPointerDragging = true
      state.lastInputTime = Date.now()
      state.downX = e.clientX
      state.downY = e.clientY
      lastPointerY = e.clientY
    }

    const handlePointerMove = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1

      if (e.pointerType === 'mouse' && !state.isTouchDevice) {
        if (!state.isZoomed) {
          state.targetMouseX = pointer.x
          state.targetMouseY = pointer.y
        }
      }

      if (!state.isPointerDragging || state.isZoomed || scrollDisabledRef?.current) return

      const dy = e.clientY - lastPointerY
      lastPointerY = e.clientY

      const speed = e.pointerType === 'touch' ? 2.5 : (state.isTouchDevice ? 1.0 : 0.5)
      state.targetY += dy * state.currentZoom * speed
      state.lastInputTime = Date.now()
    }

    const handlePointerUp = (e) => {
      state.isPointerDragging = false
      state.lastInputTime = Date.now()

      if (Math.abs(e.clientX - state.downX) < 5 && Math.abs(e.clientY - state.downY) < 5) {
        if (state.isZoomed) {
          actionsRef.current.unzoom?.()
          return
        }
        raycaster.setFromCamera(pointer, camera)
        const intersects = raycaster.intersectObjects(items.map(i => i.baseMesh))
        if (intersects.length > 0) {
          const clickedMesh = intersects[0].object
          const item = items.find(i => i.baseMesh === clickedMesh)
          if (item && item.colIndex === state.currentActiveCol) {
            actionsRef.current.zoomTo(item.group.position.x, item.group.position.y, item.data)
          }
        }
      }
    }

    const handleResize = () => {
      state.W = window.innerWidth
      state.H = window.innerHeight
      const isMobile = state.W < 768
      const GAP = isMobile ? 20 : 80

      const prevCellW = state.cellW
      const prevCellH = state.cellH
      state.cellW = state.W + GAP
      state.cellH = state.H + GAP

      if (prevCellW && prevCellH) {
        state.targetX = (state.targetX / prevCellW) * state.cellW
        state.targetY = (state.targetY / prevCellH) * state.cellH
        state.currentCamX = (state.currentCamX / prevCellW) * state.cellW
        state.currentCamY = (state.currentCamY / prevCellH) * state.cellH
      }

      renderer.setSize(state.W, state.H)
      composer.setSize(state.W, state.H)
      shaderPass.uniforms.resolution.value.set(state.W, state.H)

      const zoom = state.W > state.H ? 1.5 : 1.6
      if (!state.isZoomed) {
        state.targetZoomVal = zoom
        state.animatedZoom = zoom
      }

      items.forEach(item => {
        item.group.position.x = (item.group.position.x / prevCellW) * state.cellW
        item.group.position.y = (item.group.position.y / prevCellH) * state.cellH
        item.baseMesh.scale.set(state.W, state.H, 1)
      })
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    window.addEventListener('resize', handleResize)

    // --- Animation loop ---
    let reqId
    let shaderMouseX = 0, shaderMouseY = 0

    const animate = () => {
      reqId = requestAnimationFrame(animate)

      shaderPass.uniforms.effectIntensity.value +=
        (state.targetEffectIntensity - shaderPass.uniforms.effectIntensity.value) * 0.08

      if (Math.abs(state.animatedZoom - state.targetZoomVal) > 0.001) {
        state.animatedZoom += (state.targetZoomVal - state.animatedZoom) * 0.08
      }

      const viewW = state.W > state.H
        ? state.animatedZoom * state.W
        : state.animatedZoom * state.H * (state.W / state.H)
      const viewH = state.W > state.H
        ? viewW * (state.H / state.W)
        : state.animatedZoom * state.H

      camera.left = -viewW / 2
      camera.right = viewW / 2
      camera.top = viewH / 2
      camera.bottom = -viewH / 2
      camera.updateProjectionMatrix()

      // Snap to nearest row when idle
      if (!state.isZoomed && !state.isPointerDragging && (Date.now() - state.lastInputTime > 50)) {
        const nearestY = Math.round(state.targetY / state.cellH) * state.cellH
        state.targetY += (nearestY - state.targetY) * 0.08
      }

      state.currentCamX += (state.targetX - state.currentCamX) * 0.06
      const prevCamY = state.currentCamY
      state.currentCamY += (state.targetY - state.currentCamY) * 0.06
      state.velY = state.currentCamY - prevCamY

      state.mouseX += (state.targetMouseX - state.mouseX) * 0.05
      state.mouseY += (state.targetMouseY - state.mouseY) * 0.05

      // --- Mouse proximity effect: faster lerp than camera parallax (non-touch only) ---
      if (!state.isTouchDevice) {
        shaderMouseX += (state.targetMouseX - shaderMouseX) * 0.2
        shaderMouseY += (state.targetMouseY - shaderMouseY) * 0.2
        shaderPass.uniforms.mousePos.value.set(
          (shaderMouseX + 1) / 2,
          (shaderMouseY + 1) / 2
        )
      }

      camera.position.x = state.currentCamX + state.mouseX * state.W * 0.10
      camera.position.y = state.currentCamY + state.mouseY * state.H * 0.10

      raycaster.setFromCamera(pointer, camera)
      const intersects = raycaster.intersectObjects(items.map(i => i.baseMesh))
      const hoveredMesh = intersects.length > 0 ? intersects[0].object : null

      items.forEach(item => {
        const dx = item.group.position.x - state.currentCamX
        const dy = item.group.position.y - state.currentCamY

        const wrapX = (PHYS_COLS / 2) * state.cellW
        const wrapY = (item.colRows / 2) * state.cellH
        const distSq = (dx / state.cellW) ** 2 + (dy / state.cellH) ** 2
        item.group.position.z = -distSq * 15

        if (!state.isZoomed) {
          if (dx > wrapX) item.group.position.x -= PHYS_COLS * state.cellW
          if (dx < -wrapX) item.group.position.x += PHYS_COLS * state.cellW
          if (dy > wrapY) item.group.position.y -= item.colRows * state.cellH
          if (dy < -wrapY) item.group.position.y += item.colRows * state.cellH
        }

        item.isHovered = item.baseMesh === hoveredMesh
        const targetHoverScale =
          item.isHovered && !state.isZoomed &&
          item.colIndex === state.currentActiveCol && !state.isTouchDevice
            ? 1.05 : 1.0
        item.hoverScale += (targetHoverScale - item.hoverScale) * 0.15
        const hs = item.hoverScale

        if (item.texData && item.planes.R) {
          const aspectPlane = state.W / state.H
          const aspectImage = item.texData.imgW / item.texData.imgH
          const tex = item.texData.tex

          if (aspectPlane > aspectImage) {
            const scale = aspectImage / aspectPlane
            tex.repeat.set(1, scale)
            tex.offset.set(0, (1 - scale) / 2)
          } else {
            const scale = aspectPlane / aspectImage
            tex.repeat.set(scale, 1)
            tex.offset.set((1 - scale) / 2, 0)
          }

          item.planes.R.scale.set(state.W * hs, state.H * hs, 1)
          item.planes.G.scale.set(state.W * hs, state.H * hs, 1)
          item.planes.B.scale.set(state.W * hs, state.H * hs, 1)

          if (!state.isZoomed) {
            const splitAmount = state.velY * 1.5
            item.planes.R.position.y = splitAmount
            item.planes.B.position.y = -splitAmount
          } else {
            item.planes.R.position.y += (0 - item.planes.R.position.y) * 0.1
            item.planes.B.position.y += (0 - item.planes.B.position.y) * 0.1
          }
        }

        if (item.textGroup) {
          const fontSize = Math.min(state.W, state.H) * 0.08
          item.textGroup.scale.set(fontSize, fontSize, 1)
          item.textGroup.position.x = dx * 0.12 - state.mouseX * state.W * 0.07
          item.textGroup.position.y = dy * 0.12 - state.mouseY * state.H * 0.07

          item.textMeshes.forEach(mesh => {
            mesh.rotation.x += (state.targetLetterRotation - mesh.rotation.x) * 0.08
            mesh.rotation.y += (state.targetLetterRotation - mesh.rotation.y) * 0.08
          })
        }
      })

      composer.render()
    }

    animate()

    // --- Cleanup on unmount ---
    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      window.removeEventListener('resize', handleResize)
      renderer.dispose()
    }
  }, [portfolios])

  return actionsRef
}
