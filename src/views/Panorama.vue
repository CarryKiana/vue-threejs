<template>
  <div ref="pamoramaBox" class="pamorama">
    <div v-show="panelVisible" class="dialog">
      <div class="dialog-body">
        <div class="dialog-content">这里是仪表板</div>
        <div class="dialog-close" @click="showPanel">&times;</div>
      </div>
    </div>
  </div>
</template>
<script>
import * as THREE from 'three/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
export default {
  name: 'pamorama',
  data() {
    return {
      scene: null,
      group: null,
      camera: null,
      renderer: null,
      controls: null,
      textures: null,
      materials: null,
      skyBox: null,
      tilesNum: 6,
      spriteTimes: 0,
      mouse: null,
      panelVisible: false
    }
  },
  created() {
    this.$nextTick(() => {
      this.main()
    })
  },
  methods: {
    // 主入口
    main() {
      this.init()
      this.animate()
    },
    // 初始化
    init() {
      this.initScene()
      this.initCamera()
      this.initRenderer()
      this.initControls()
      this.loadingTextures()
      this.addSprite()
      // this.setAxisHelper()
    },
    // 初始化场景
    initScene() {
      this.scene = new THREE.Scene()
      this.ambient = new THREE.AmbientLight( 0x666666 ); // 创建环境光
      this.scene.add( this.ambient );
      this.group = new THREE.Group()
      this.scene.add(this.group)
    },
    // 初始化相机
    initCamera() {
      this.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 20000)
      this.camera.position.z = 0.1
    },
    // 初始化渲染器
    initRenderer() {
      this.renderer = new THREE.WebGLRenderer()
      this.renderer.setPixelRatio(window.devicePixelRatio)
      this.renderer.setSize(window.innerWidth, window.innerHeight)
      this.$refs.pamoramaBox.appendChild(this.renderer.domElement)
    },
    // 初始化控制器
    initControls() {
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      this.controls.enableZoom = false
      this.controls.enablePan = false
      this.controls.enableDamping = true
      this.controls.rotateSpeed = - 0.25
    },
    // 加载全景图所需的图片资源
    loadingTextures() {
      const textures = []
      for (let i = 0; i < this.tilesNum; i++) {
        textures[i] = new THREE.Texture()
      }
      const imageArr = [
        'l1_r_01_01.jpg', // 右
        'l1_l_01_01.jpg', // 左
        'l1_u_01_01.jpg', // 上
        'l1_d_01_01.jpg', // 下
        'l1_f_01_01.jpg', // 前
        'l1_b_01_01.jpg' // 后
      ]
      // 六面贴图顺序:  右、左、上、下、前、后
      for (let i = 0; i < 6; i++) {
        const imageObj = new Image()
        imageObj.onload = () => {
          let canvas, context
          const tileWidth = imageObj.width
          canvas = document.createElement('canvas')
          context = canvas.getContext('2d')
          canvas.height = tileWidth
          canvas.width = tileWidth
          context.drawImage(imageObj, 0, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth)
          textures[i].image = canvas
          textures[i].needsUpdate = true
        }
        imageObj.src = require(`@/assets/${imageArr[i]}`)
      }
      this.textures = textures
      const materials = []
      for (let i = 0; i < this.tilesNum; i++) {
        materials.push(new THREE.MeshBasicMaterial({
          map: textures[i]
        }))
      }
      this.materials = materials
      this.skyBox = new THREE.Mesh(new THREE.BoxGeometry(5000, 5000, 5000), this.materials)
      this.skyBox.geometry.scale(1, 1, -1)
      this.scene.add(this.skyBox)
      window.addEventListener( 'resize', this.onWindowResize, false );
      window.addEventListener('mousedown', this.onMouseDown, false)
    },
    // 添加物体标注
    addSprite() {
      const spriteMap = new THREE.Texture()
      const imageObj = new Image()
      imageObj.onload = () => {
        let canvas, context
        const tileWidth = imageObj.width
        canvas = document.createElement('canvas')
        context = canvas.getContext('2d')
        canvas.height = tileWidth
        canvas.width = tileWidth
        context.drawImage(imageObj, 0, 0, tileWidth, tileWidth, 0, 0, tileWidth, tileWidth)
        spriteMap.image = canvas
        spriteMap.needsUpdate = true
      }
      imageObj.src = require(`@/assets/dynamic_scene0.png`)
      const spriteMaterial = new THREE.SpriteMaterial({
        map: spriteMap,
        color: 0xffffff,
        depthTest: false
      })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.set( -0.4, -1,-10 );
      sprite.center.set( 0.5, 0.5 );
      sprite.name = 'panel_sprite'
      this.sprite = sprite
      this.group.add(sprite)
    },
    // 更新标注纹理
    changeSpriteMap() {
      this.spriteTimes = (this.spriteTimes + 0.2) % 30
      const spriteMap = new THREE.Texture()
      const imageObj = new Image()
      imageObj.onload = () => {
        let canvas, context
        const tileWidth = imageObj.width
        canvas = document.createElement('canvas')
        context = canvas.getContext('2d')
        canvas.height = tileWidth
        canvas.width = tileWidth
        context.drawImage(imageObj, 0, tileWidth * Math.floor(this.spriteTimes), tileWidth, tileWidth, 0, 0, tileWidth, tileWidth)
        spriteMap.image = canvas
        this.sprite.material.map = spriteMap
        this.sprite.material.map.needsUpdate = true
      }
      imageObj.src = require(`@/assets/dynamic_scene0.png`)
    },
    // 执行渲染
    render() {
      this.renderer.render(this.scene, this.camera)
    },
    // 循环渲染
    animate() {
      requestAnimationFrame(this.animate)
      this.controls.update()
      this.changeSpriteMap()
      this.render()
    },
    // 监听窗口变化
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight
      this.camera.updateProjectionMatrix()
      this.renderer.setSize(window.innerWidth, window.innerHeight)
    },
    // 添加模型拾取器
    initRaycaster() {
      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(this.mouse, this.camera)
      let intersection = []
      intersection = raycaster.intersectObject(this.group, true)
      if (intersection.length > 0) {
        const instance = intersection[0]
        this.handleInstance(instance)
      }
    },
    // 对拾取到的对象调用不同的逻辑进行处理
    handleInstance(instance) {
      const name = instance.object.name
      switch(name) {
        case 'panel_sprite':
          this.showPanel()
          break
        default:
          break
      }
    },
    // 显示仪表板
    showPanel() {
      this.panelVisible = !this.panelVisible
    },
    // 监听鼠标点击事件
    onMouseDown(event) {
      if (!this.mouse) {
        this.mouse = new THREE.Vector2(1, 1)
      }
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
      this.initRaycaster()
    },
    // 添加辅助坐标系
    setAxisHelper() {
      this.axisHelper = new THREE.AxesHelper(250)
      this.scene.add(this.axisHelper)
    }
  }
}
</script>
<style lang="scss" scoped>
.dialog {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color:rgba(0,0,0,0.7);
  .dialog-body {
    background-color:#fff;
    width: 300px;
    height: 250px;
    margin: 30px auto;
    position: relative;
    .dialog-content {
      padding-top: 30px;
      text-align: center;
    }
    .dialog-close {
      position: absolute;
      top: 0;
      right: 0;
      width: 30px;
      height: 30px;
      font-size: 18px;
      text-align: center;
      line-height:30px;
      cursor: pointer;
    }
  }
}
</style>