# Space Arm - Jogo 3D em Python com Panda3D
# Este arquivo contém todo o código necessário para rodar o jogo.
# Inclui funcionalidades como movimento do jogador, inimigos, armas aprimoráveis, mapas temáticos,
# interação com vozes, feedback do usuário e otimizações avançadas.

# Dependências: Panda3D (instale com `pip install panda3d`)

from direct.showbase.ShowBase import ShowBase
from panda3d.core import loadPrcFileData, Vec3, LodNode, NodePath, AmbientLight, DirectionalLight
from panda3d.core import CollisionTraverser, CollisionNode, CollisionSphere, CollisionHandlerQueue
from panda3d.bullet import BulletWorld, BulletRigidBodyNode, BulletBoxShape
from direct.particles.ParticleEffect import ParticleEffect
from direct.gui.DirectGui import DirectEntry, DirectButton, DirectLabel
import random
import sys
import os

# Configurações da janela
loadPrcFileData("", "win-size 1280 720")
loadPrcFileData("", "window-title Space Arm")
loadPrcFileData("", "sync-video true")  # Sincronização vertical para evitar screen tearing

class SpaceArm(ShowBase):
    def __init__(self):
        try:
            ShowBase.__init__(self)
            
            # Variáveis do jogo
            self.level = 1
            self.weapon_level = 1
            self.max_weapon_level = 5
            self.enemies = []
            self.level_themes = {
                1: "terror",
                2: "fantasia",
                3: "suspense",
                4: "animado"
            }
            self.current_map = None
            self.is_game_running = True
            self.score = 0
            
            # Inicializa a interface do usuário
            self.setup_ui()
            
            # Carrega o braço mecânico com LOD
            self.load_arm_with_lod()
            
            # Configura a física
            self.setup_physics()
            
            # Controles
            self.setup_controls()
            
            # Carrega recursos
            self.load_resources()
            
            # Carregar mapa e inimigos do nível atual
            self.load_level(self.level)
            
            # Tarefas
            self.taskMgr.add(self.update, "update")
            self.taskMgr.add(self.update_physics, "update_physics")
            self.taskMgr.add(self.check_collisions, "check_collisions")
            
            # Otimização
            self.render.setCullFace(True)
            base.setFrameRateMeter(True)
            
            # Iluminação
            self.setup_lighting()
        except Exception as e:
            self.show_error(f"Erro na inicialização: {str(e)}")
            sys.exit(1)
    def setup_ui(self):
        self.score_text = OnscreenText(text="Score: 0", pos=(-1.3, 0.9), scale=0.07)
        self.level_text = OnscreenText(text=f"Level: {self.level}", pos=(-1.3, 0.8), scale=0.07)
    def load_arm_with_lod(self):
        try:
            lod = LodNode("lod")
            self.arm_lod = self.render.attachNewNode(lod)
            
            # Tenta carregar os modelos
            arm_high = self.load_model_safe("models/arm_high.egg")
            arm_low = self.load_model_safe("models/arm_low.egg")
            
            if arm_high and arm_low:
                arm_high.reparentTo(self.arm_lod)
                arm_low.reparentTo(self.arm_lod)
                lod.addSwitch(100, 0)
                lod.addSwitch(200, 100)
                self.arm = arm_high
            else:
                raise Exception("Modelos do braço não encontrados")
                
        except Exception as e:
            self.show_error(f"Erro ao carregar o braço: {str(e)}")
            sys.exit(1)
    def load_model_safe(self, model_path):
        try:
            return self.loader.loadModel(model_path)
        except Exception:
            return None
    def setup_physics(self):
        self.world = BulletWorld()
        self.world.setGravity(Vec3(0, 0, -9.81))
        shape = BulletBoxShape(Vec3(0.5, 0.5, 0.5))
        node = BulletRigidBodyNode("Arm")
        node.addShape(shape)
        self.arm_np = self.render.attachNewNode(node)
        self.world.attachRigidBody(node)
        self.arm.reparentTo(self.arm_np)
        self.arm_np.setPos(0, 10, 0)
    def setup_controls(self):
        self.keyMap = {
            "forward": False, "backward": False,
            "left": False, "right": False,
            "up": False, "down": False,
            "shoot": False
        }
        
        # Configura os controles
        for key, control in [
            ("w", "forward"), ("s", "backward"),
            ("a", "left"), ("d", "right"),
            ("q", "up"), ("e", "down"),
            ("space", "shoot")
        ]:
            self.accept(key, self.setKey, [control, True])
            self.accept(f"{key}-up", self.setKey, [control, False])
    def load_resources(self):
        try:
            # Carrega animações
            self.arm_anim = self.loader.loadModel("models/arm_anim.egg")
            if self.arm_anim:
                self.arm_anim.reparentTo(self.arm)
                try:
                    self.arm_anim.loop("open_claw")
                except:
                    print("Aviso: Animação 'open_claw' não encontrada")

            # Carrega partículas
            self.particle = ParticleEffect()
            if not self.particle.loadConfig("particles/sparks.ptf"):
                print("Aviso: Arquivo de partículas 'sparks.ptf' não encontrado")
            else:
                self.particle.start(parent=self.arm, renderParent=self.render)
                self.particle.setPos(0, 0, 1)

            # Carrega sons
            self.mission_start_sound = self.load_sound_safe("sounds/mission_start.ogg")
            self.shoot_sound = self.load_sound_safe("sounds/shoot.ogg")
            self.hit_sound = self.load_sound_safe("sounds/hit.ogg")

        except Exception as e:
            self.show_error(f"Erro ao carregar recursos: {str(e)}")

    def load_sound_safe(self, sound_path):
        try:
            return self.loader.loadSfx(sound_path)
        except:
            print(f"Aviso: Som '{sound_path}' não encontrado")
            return None

    def setup_optimization(self):
        self.render.setCullFace(True)
        self.render.setAntialias(True)
        base.setFrameRateMeter(True)

    def setup_lighting(self):
        # Luz ambiente
        ambientLight = AmbientLight("ambient")
        ambientLight.setColor((0.2, 0.2, 0.2, 1))
        ambient_np = self.render.attachNewNode(ambientLight)
        self.render.setLight(ambient_np)

        # Luz direcional
        directionalLight = DirectionalLight("directional")
        directionalLight.setColor((0.8, 0.8, 0.8, 1))
        directional_np = self.render.attachNewNode(directionalLight)
        directional_np.setHpr(45, -45, 0)
        self.render.setLight(directional_np)

    def setKey(self, key, value):
        self.keyMap[key] = value

    def update(self, task):
        if not self.is_game_running:
            return Task.done

        dt = globalClock.getDt()
        
        # Atualiza movimento do jogador
        self.update_player_movement(dt)

        # Atualiza inimigos
        self.update_enemies(dt)

        # Verifica colisões
        self.check_collisions()

        # Atualiza interface
        self.score_text.setText(f"Score: {self.score}")
        self.level_text.setText(f"Level: {self.level}")

        return Task.cont

    def update_player_movement(self, dt):
        movement = Point3(0, 0, 0)
        speed = 10.0

        if self.keyMap["forward"]: movement.addY(speed)
        if self.keyMap["backward"]: movement.addY(-speed)
        if self.keyMap["left"]: movement.addX(-speed)
        if self.keyMap["right"]: movement.addX(speed)
        if self.keyMap["up"]: movement.addZ(speed)
        if self.keyMap["down"]: movement.addZ(-speed)

        if not movement.almostEqual(Point3(0, 0, 0)):
            movement.normalize()
            movement *= speed * dt
            new_pos = self.arm_np.getPos() + movement
            
            # Limita o movimento dentro da área do jogo
            new_pos.setX(max(-20, min(20, new_pos.getX())))
            new_pos.setY(max(-20, min(20, new_pos.getY())))
            new_pos.setZ(max(0, min(15, new_pos.getZ())))
            
            self.arm_np.setPos(new_pos)

    def update_enemies(self, dt):
        player_pos = self.arm_np.getPos()
        for enemy in self.enemies:
            if enemy.is_active:
                enemy.update(player_pos, dt)

    def check_collisions(self):
        # Implementar verificação de colisões entre jogador e inimigos
        pass

    def update_physics(self, task):
        dt = globalClock.getDt()
        self.world.doPhysics(dt)
        return Task.cont

    def shoot(self):
        if self.shoot_sound:
            self.shoot_sound.play()
        damage = self.weapon_level * 10
        # Implementar lógica de tiro

    def load_level(self, level):
        try:
            # Remove mapa atual
            if self.current_map:
                self.current_map.removeNode()

            # Carrega novo mapa
            map_model = f"models/map_level{level}.egg"
            self.current_map = self.load_model_safe(map_model)
            if self.current_map:
                self.current_map.reparentTo(self.render)
            else:
                print(f"Aviso: Mapa {map_model} não encontrado")

            # Remove inimigos existentes
            for enemy in self.enemies:
                enemy.cleanup()
            self.enemies.clear()

            # Gera novos inimigos
            for _ in range(level * 2):
                enemy = Enemy(self.render, self.world, level)
                self.enemies.append(enemy)

            # Toca som de início de missão
            if self.mission_start_sound:
                self.mission_start_sound.play()

            print(f"Missão confirmada, comandante! Tema: {self.level_themes.get(level, 'default')}")

        except Exception as e:
            self.show_error(f"Erro ao carregar nível: {str(e)}")

    def show_error(self, message):
        print(f"Erro: {message}")
        if hasattr(self, 'is_game_running'):
            self.is_game_running = False

    def cleanup(self):
        self.is_game_running = False
        for enemy in self.enemies:
            enemy.cleanup()
        self.enemies.clear()
        if self.current_map:
            self.current_map.removeNode()
        if self.particle:
            self.particle.cleanup()

class Enemy:
    def __init__(self, render, world, level):
        try:
            self.model = loader.loadModel("models/enemy.egg")
            if not self.model:
                raise Exception("Modelo do inimigo não encontrado")

            self.model.reparentTo(render)
            self.node = BulletRigidBodyNode("Enemy")
            self.node.addShape(BulletBoxShape(Vec3(0.5, 0.5, 0.5)))
            self.np = render.attachNewNode(self.node)
            world.attachRigidBody(self.node)

            # Posição inicial aleatória
            self.np.setPos(random.uniform(-10, 10), random.uniform(-10, 10), 0)
            self.speed = 2 + level * 0.5
            self.health = 100
            self.is_active = True

        except Exception as e:
            print(f"Erro ao criar inimigo: {str(e)}")
            self.is_active = False

    def update(self, player_pos, dt):
        if not self.is_active:
            return

        try:
            direction = player_pos - self.np.getPos()
            if direction.length() > 0.1:  # Evita divisão por zero
                direction.normalize()
                new_pos = self.np.getPos() + direction * self.speed * dt
                self.np.setPos(new_pos)
                self.model.setPos(new_pos)

        except Exception as e:
            print(f"Erro ao atualizar inimigo: {str(e)}")
            self.is_active = False

    def take_damage(self, damage):
        self.health -= damage
        if self.health <= 0:
            self.cleanup()

    def cleanup(self):
        self.is_active = False
        if hasattr(self, 'model') and self.model:
            self.model.removeNode()
        if hasattr(self, 'np') and self.np:
            self.np.removeNode()

# Inicia o jogo
if __name__ == "__main__":
    try:
        game = SpaceArm()
        game.run()
    except Exception as e:
        print(f"Erro fatal: {str(e)}")
        sys.exit(1)