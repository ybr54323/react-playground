import { useState, useEffect, useRef } from 'react'
import './App.css'
import vertex from './vertex.glsl'
import fragment from './fragment.glsl'
// @ts-ignore
import * as THREE from 'three'
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// @ts-ignore
import GUI from 'lil-gui'
// @ts-ignore
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'




/**
* Material
*/
const materialParameters: { color: string, shadeColor: string, lightColor: string } = {
  color: '#ff794d',
  shadeColor: '#8e19b8',
  lightColor: '#e5ffe0'
}

function App() {



  const canvasRef = useRef<HTMLCanvasElement>(null)

  const gltfLoader = new GLTFLoader()
  useEffect(() => {
    if (!canvasRef.current) return

    const gui = new GUI()

    // 创建场景
    const scene = new THREE.Scene()

    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.z = 5

    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true
    })
    renderer.setSize(window.innerWidth, window.innerHeight)

    // 添加 OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true // 添加阻尼效果使控制更平滑
    controls.dampingFactor = 0.05




    const material = new THREE.ShaderMaterial({
      fragmentShader: fragment, vertexShader: vertex,
      uniforms: {
        uResolution: new THREE.Uniform(new THREE.Vector2(window.innerWidth, window.innerHeight)),

        uColor: new THREE.Uniform(new THREE.Color(materialParameters.color)),
        uShadeColor: new THREE.Uniform(new THREE.Color(materialParameters.shadeColor)),
        uShadowRepetitions: new THREE.Uniform(100),
        uShadowColor: new THREE.Uniform(new THREE.Color(materialParameters.shadeColor)),
        uLightRepetitions: new THREE.Uniform(200),
        uLightColor: new THREE.Uniform(new THREE.Color(materialParameters.lightColor))
      }
    })

    /**
 * Objects
 */
    // Torus knot
    const torusKnot = new THREE.Mesh(
      new THREE.TorusKnotGeometry(0.6, 0.25, 128, 32),
      material
    )
    torusKnot.position.x = 3
    scene.add(torusKnot)

    // Sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(),
      material
    )
    sphere.position.x = - 3
    scene.add(sphere)



    // Suzanne
    let suzanne: THREE.Group | null = null

    gltfLoader.load(
      window.parent.location.pathname + '/suzanne.glb', // 使用父窗口的域名
      (gltf: GLTFLoader) => {
        suzanne = gltf.scene
        suzanne.traverse((child: any) => {
          if (child.isMesh)
            child.material = material
        })
        scene.add(suzanne)
      }
    )


    // 动画循环
    const animate = () => {
      requestAnimationFrame(animate)
      // cube.rotation.x += 0.01
      // cube.rotation.y += 0.01
      renderer.render(scene, camera)
    }
    animate()


    gui
      .addColor(materialParameters, 'color')
      .onChange(() => {
        material.uniforms.uColor.value.set(materialParameters.color)
      })

    gui
      .add(material.uniforms.uShadowRepetitions, 'value')
      .min(1)
      .max(300)
      .step(1)

    gui
      .addColor(materialParameters, 'shadeColor')
      .onChange(() => {
        material.uniforms.uShadowColor.value.set(materialParameters.shadeColor)
      })

    gui
      .add(material.uniforms.uLightRepetitions, 'value')
      .min(1)
      .max(300)
      .step(1)

    gui
      .addColor(materialParameters, 'lightColor')
      .onChange(() => {
        material.uniforms.uLightColor.value.set(materialParameters.lightColor)
      })



    // 添加窗口大小变化监听
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // 更新相机宽高比
      camera.aspect = width / height
      camera.updateProjectionMatrix()

      // 更新渲染器大小
      renderer.setSize(width, height)

      // Update materials
      material.uniforms.uResolution.value.set(width * window.devicePixelRatio, height * window.devicePixelRatio)

      // Update renderer
      renderer.setPixelRatio(window.devicePixelRatio)

    }

    window.addEventListener('resize', handleResize)

    // 清理函数
    return () => {
      material.dispose()
      renderer.dispose()
      suzanne.dispose()

      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} />
    </>
  )
}

export default App