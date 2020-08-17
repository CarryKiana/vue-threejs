<template>
  <div ref="box" class="area">
    <div class="buttons">
      <div class="color">
        <div class="title">车身颜色</div>
        <div class="content">
          <div class="cycle black" @click="changeBodyColor('black')"></div>
          <div class="cycle red" @click="changeBodyColor('red')"></div>
          <div class="cycle blue" @click="changeBodyColor('blue')"></div>
        </div>
      </div>
      <div class="animation">
        <div class="title">轮胎转动</div>
        <div class="content">
          <div @click="changeWheel('wheel_FR')">右前轮</div>
          <div @click="changeWheel('wheel_RR')">右后轮</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import * as THREE from 'three/build/three.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
// const TWEEN = require('@tweenjs/tween.js');
import TWEEN from '@tweenjs/tween.js'
export default {
  name: 'final',
  data() {
    return {
      scene: null,
      camera: null,
      ambient: null,
      light: null,
      container: null,
      renderer: null,
      controls: null,
      mouse: new THREE.Vector2(1, 1),
      ground: null,
      car: null,
      open: false,
      sprite: null
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
      this.init() // 初始化
      this.animate() // 循环更新
    },
    // 初始化
    init() {
      this.initSence() // 初始化场景
      this.initCamera() // 初始化相机
      this.initLight() // 添加灯光
      this.initMash() // 添加各种物体
      this.initRenderer() // 初始化渲染器
      this.initControl() // 添加控制器
      this.setAxisHelper() // 添加辅助坐标系
    },
    // 初始化场景
    initSence() {
      this.scene = new THREE.Scene(); // 创建场景对象
			this.scene.background = new THREE.Color( 0xcce0ff ); // 设置场景背景色
			// this.scene.fog = new THREE.Fog( 0xcce0ff, 500, 10000 ); // 设置雾化效果
    },
    // 初始化相机
    initCamera() {
      // fov 摄像机视锥体垂直视野角度, aspect 摄像机视锥体长宽比, near 摄像机视锥体近端面, far 摄像机视锥体远端面
      this.camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 100000 ); // 创建相机对象
      this.camera.position.set( 5000, 5000, 5000 ); // 设置相机初始位置
      this.camera.up = new THREE.Vector3( 0, 0, 1 );
      this.camera.lookAt(this.scene.position)
    },
    // 添加灯光
    initLight() {
      this.ambient = new THREE.AmbientLight( 0x666666 ); // 创建环境光
      this.scene.add( this.ambient );

      this.light = new THREE.DirectionalLight( 0xdfebff, 1 ); // 添加平行光
			this.light.position.set( 50, 200, 100 );
			this.light.position.multiplyScalar( 1.3 );

			this.light.castShadow = true;

			this.light.shadow.mapSize.width = 1024;
			this.light.shadow.mapSize.height = 1024;

      const d = 300;

      this.light.shadow.camera.left = - d;
      this.light.shadow.camera.right = d;
      this.light.shadow.camera.top = d;
      this.light.shadow.camera.bottom = - d;

      this.light.shadow.camera.far = 1000;

      this.scene.add( this.light );
    },
    //添加物体
    initMash() {
      this.group = new THREE.Group()
      this.scene.add(this.group)
      // 地板
      this.addGround()
      // 车
      this.addCar()
      // 标注
      this.addSprite()
    },
    // 添加物体--地平面
    addGround() {
      const geometry = new THREE.BoxGeometry(10000, 10000, 1)
      const material = new THREE.MeshPhongMaterial({
        color: 0x282C34,
        specular:0x999999,
        shininess:2
      })
      const mesh = new THREE.Mesh(geometry, material)
      this.ground = mesh
      this.group.add(mesh)
    },
    // 添加物体--车
    addCar() {
      const loader = new FBXLoader()
      loader.load('model/BentleyContinentalGT_hi.FBX', object => {
        object.position.z = 1300
        object.traverse( function ( child ) {
						if ( child.isMesh ) {
							child.castShadow = true
							child.receiveShadow = true
						}
          } );
          this.car = object
          this.group.add( object )
          window.addEventListener( 'mousedown', this.onMouseDown, false )
      })
    },
    // 添加物体--标注
    addSprite() {
      // 车右前轮的标注
      const spriteMap = new THREE.TextureLoader().load(require('@/assets/1.png'))
      const spriteMaterial = new THREE.SpriteMaterial({
        map: spriteMap,
        color: 0xffffff
      })
      const sprite = new THREE.Sprite(spriteMaterial)
      sprite.position.set( 1100, 1500, 900 );
      sprite.center.set( 0.0, 0.0 );
      sprite.scale.set( 200, 200 );
      sprite.name = 'wheel_FR_sprite'
      this.sprite = sprite
      this.group.add( sprite )
    },
    // 初始化渲染器
    initRenderer() {
      this.renderer = new THREE.WebGLRenderer( { antialias: true } ) // 抗锯齿
      this.renderer.setPixelRatio( window.devicePixelRatio ) // 设置设备像素比
      this.renderer.setSize( window.innerWidth, window.innerHeight ) // 设置输出canvas大小
      this.$refs.box.appendChild( this.renderer.domElement ) // 输出的canvas元素
      this.renderer.outputEncoding = THREE.sRGBEncoding
      this.renderer.shadowMap.enabled = true
    },
    // 执行渲染
    render() {
      TWEEN.update()
      this.renderer.clear()
      this.renderer.render( this.scene, this.camera );
    },
    // 循环渲染
    animate() {
      requestAnimationFrame( this.animate )
      this.render();
    },
    // 添加控制器
    initControl() {
      this.controls = new OrbitControls( this.camera, this.renderer.domElement );
      window.addEventListener( 'resize', this.onWindowResize, false );
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
      if (name) {
        switch(name) {
          case 'wheel_FR_sprite':
            this.changeWheel('wheel_FR')
            break
          default: 
          break
        }
      }
    },
    // 窗口自适应
    onWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize( window.innerWidth, window.innerHeight );
    },
    // 监听鼠标移动事件
    onMouseMove(event) {
      if (!this.mouse) {
        this.mouse = new THREE.Vector2(1, 1)
      }
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
      if (this.car) {
        this.initRaycaster()
      }
    },
    // 监听鼠标点击事件
    onMouseDown(event) {
      if (!this.mouse) {
        this.mouse = new THREE.Vector2(1, 1)
      }
      this.mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1
      this.mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1
      if (this.car) {
        this.initRaycaster()
      }
    },
    // 添加交互动画
    setupTween() {
      const car = this.car.getObjectByName('wheel_FR')
      const tween = new TWEEN.Tween({z: 0}).to({z: Math.PI/6}, 1000)
      
      tween.easing(TWEEN.Easing.Elastic.InOut).onUpdate(function(obj) {
        car.rotation.set(0,0, obj.z)
      })
      const tweenback = new TWEEN.Tween({z:Math.PI/6}).to({z:0}, 1000)
      tweenback.easing(TWEEN.Easing.Elastic.InOut).onUpdate(function(obj) {
        car.rotation.set(0,0, obj.z)
      })
      this.open = !this.open
      if (this.open) {
        tween.start()
      } else {
        tweenback.start()
      }
    },
    // 添加辅助坐标系
    setAxisHelper() {
      this.axisHelper = new THREE.AxesHelper(250)
      this.scene.add(this.axisHelper)
    },
    // 更改车身颜色
    changeBodyColor(color) {
      let colorValue = 0xffffff
      if (this.car) {
        switch(color) {
          case 'black':
            colorValue = 0x000000
            break
          case 'red':
            colorValue = 0xff0000
            break
          case 'blue':
            colorValue = 0x0000ff
            break
          default:
            colorValue = 0xffffff
        }
        const body = this.car.getObjectByName('carpaint_body')
        body.material.color.set( colorValue );
      }
    },
    // 转动车轮
    changeWheel(name) {
      if (this.car) {
        const wheel = this.car.getObjectByName(name)
        const tween = new TWEEN.Tween({z: 0}).to({z: Math.PI/6}, 1000)
        tween.easing(TWEEN.Easing.Elastic.InOut).onUpdate(function(obj) {
          wheel.rotation.set(0,0, obj.z)
        })
        const tweenback = new TWEEN.Tween({z:Math.PI/6}).to({z:0}, 1000)
        tweenback.easing(TWEEN.Easing.Elastic.InOut).onUpdate(function(obj) {
          wheel.rotation.set(0,0, obj.z)
        })
        this.open = !this.open
        if (this.open) {
          tween.start()
        } else {
          tweenback.start()
        }
      }
    }
  }
}
</script>
<style>
.area {
  position:relative;
}
.buttons {
  position:absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background-color: rgba(0,0,0,0.3);
  overflow: hidden;
}
.color {
  flex:auto;
}
.color .title {
  color: #fff;
  text-align: center;
}
.color .content {
  display: flex;
  justify-content: space-around
}
.cycle {
  width: 30px;
  height: 30px;
  margin: 5px;
  border-radius: 100%;
}
.black {
  background-color: #000;
}
.red {
  background-color:red;
}
.blue {
  background-color :blue;
}
.animation {
  flex:auto;
}
.animation .title {
  color: #fff;
  text-align: center;
}
.animation .content {
  display: flex;
  color: #fff;
  justify-content: space-around
}
/* .front,.reat {

} */
</style>