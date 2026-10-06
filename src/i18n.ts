import messages from './locales.generated.json';
import { helpRows } from './i18n-help';
import { extraRows } from './i18n-extra';
import type { Locale } from './preferences';
import { readPreferences } from './preferences';
const rows=`
Rig|Rig|Rig|Rig|Rig|リグ|绑定
Animate|Animar|Animar|Animer|Animieren|アニメーション|动画
Assemble|Montar|Montar|Assembler|Zusammenstellen|構成|合成
New project|Novo projeto|Nuevo proyecto|Nouveau projet|Neues Projekt|新規プロジェクト|新建项目
Open project|Abrir projeto|Abrir proyecto|Ouvrir un projet|Projekt öffnen|プロジェクトを開く|打开项目
Recent projects|Projetos recentes|Proyectos recientes|Projets récents|Letzte Projekte|最近のプロジェクト|最近项目
Learn with the example|Aprender com o exemplo|Aprender con el ejemplo|Apprendre avec l’exemple|Mit dem Beispiel lernen|サンプルで学ぶ|通过示例学习
Start creating|Começar a criar|Empezar a crear|Commencer à créer|Mit dem Gestalten beginnen|制作を始める|开始创作
Preferences|Preferências|Preferencias|Préférences|Einstellungen|環境設定|偏好设置
Language|Idioma|Idioma|Langue|Sprache|言語|语言
Check for updates|Verificar atualizações|Buscar actualizaciones|Vérifier les mises à jour|Nach Updates suchen|更新を確認|检查更新
Notify me about updates|Avisar sobre atualizações|Avisar sobre actualizaciones|M’avertir des mises à jour|Über Updates informieren|更新を通知する|通知新版本
Open download page|Abrir página de download|Abrir página de descarga|Ouvrir la page de téléchargement|Downloadseite öffnen|ダウンロードページを開く|打开下载页面
available|disponível|disponible|disponible|verfügbar|利用可能|可用
current|atualizado|actualizado|à jour|aktuell|最新|已是最新
unavailable|indisponível|no disponible|indisponible|nicht verfügbar|利用不可|不可用
unconfigured|não configurado|sin configurar|non configuré|nicht konfiguriert|未設定|未配置
Restore layout|Restaurar layout|Restaurar diseño|Réinitialiser la disposition|Layout zurücksetzen|レイアウトを初期化|重置布局
Layers|Camadas|Capas|Calques|Ebenen|レイヤー|图层
Characters|Personagens|Personajes|Personnages|Figuren|キャラクター|角色
Library|Biblioteca|Biblioteca|Bibliothèque|Bibliothek|ライブラリ|素材库
Shots|Cenas|Escenas|Plans|Szenen|ショット|镜头
Properties|Propriedades|Propiedades|Propriétés|Eigenschaften|プロパティ|属性
Connect|Conectar|Conectar|Connecter|Verbinden|接続|连接
Humanoid assistant|Assistente humanoide|Asistente humanoide|Assistant humanoïde|Humanoider Assistent|人型リグアシスタント|人形绑定向导
Assign parts|Associar peças|Asignar piezas|Associer les pièces|Teile zuordnen|パーツを割り当てる|分配部件
Place joints|Posicionar juntas|Colocar articulaciones|Placer les articulations|Gelenke platzieren|関節を配置|放置关节
Test movement|Testar movimento|Probar movimiento|Tester le mouvement|Bewegung testen|動きをテスト|测试动作
Apply character|Aplicar personagem|Aplicar personaje|Appliquer le personnage|Figur anwenden|キャラクターを適用|应用角色
Work on a copy|Trabalhar numa cópia|Trabajar en una copia|Travailler sur une copie|Mit einer Kopie arbeiten|コピーで作業|在副本上操作
Cancel|Cancelar|Cancelar|Annuler|Abbrechen|キャンセル|取消
Next|Próximo|Siguiente|Suivant|Weiter|次へ|下一步
Back|Voltar|Atrás|Retour|Zurück|戻る|返回
Name|Nome|Nombre|Nom|Name|名前|名称
None|Nenhum|Ninguno|Aucun|Keine|なし|无
torso|tronco|tronco|torse|Rumpf|胴体|躯干
head|cabeça|cabeza|tête|Kopf|頭|头部
leftArm|braço esquerdo inteiro|brazo izquierdo completo|bras gauche entier|ganzer linker Arm|左腕全体|完整左臂
rightArm|braço direito inteiro|brazo derecho completo|bras droit entier|ganzer rechter Arm|右腕全体|完整右臂
leftUpperArm|braço esquerdo|brazo superior izquierdo|haut du bras gauche|linker Oberarm|左上腕|左上臂
rightUpperArm|braço direito|brazo superior derecho|haut du bras droit|rechter Oberarm|右上腕|右上臂
leftForearm|antebraço esquerdo|antebrazo izquierdo|avant-bras gauche|linker Unterarm|左前腕|左前臂
rightForearm|antebraço direito|antebrazo derecho|avant-bras droit|rechter Unterarm|右前腕|右前臂
leftHand|mão esquerda|mano izquierda|main gauche|linke Hand|左手|左手
rightHand|mão direita|mano derecha|main droite|rechte Hand|右手|右手
leftLeg|perna esquerda inteira|pierna izquierda completa|jambe gauche entière|ganzes linkes Bein|左脚全体|完整左腿
rightLeg|perna direita inteira|pierna derecha completa|jambe droite entière|ganzes rechtes Bein|右脚全体|完整右腿
leftThigh|coxa esquerda|muslo izquierdo|cuisse gauche|linker Oberschenkel|左太もも|左大腿
rightThigh|coxa direita|muslo derecho|cuisse droite|rechter Oberschenkel|右太もも|右大腿
leftShin|canela esquerda|pantorrilla izquierda|bas de la jambe gauche|linker Unterschenkel|左すね|左小腿
rightShin|canela direita|pantorrilla derecha|bas de la jambe droite|rechter Unterschenkel|右すね|右小腿
leftFoot|pé esquerdo|pie izquierdo|pied gauche|linker Fuß|左足|左脚掌
rightFoot|pé direito|pie derecho|pied droit|rechter Fuß|右足|右脚掌
neck|pescoço|cuello|cou|Hals|首|颈部
hip|quadril|cadera|bassin|Becken|骨盤|骨盆
leftShoulder|ombro esquerdo|hombro izquierdo|épaule gauche|linke Schulter|左肩|左肩
rightShoulder|ombro direito|hombro derecho|épaule droite|rechte Schulter|右肩|右肩
leftElbow|cotovelo esquerdo|codo izquierdo|coude gauche|linker Ellbogen|左肘|左肘
rightElbow|cotovelo direito|codo derecho|coude droit|rechter Ellbogen|右肘|右肘
leftWrist|punho esquerdo|muñeca izquierda|poignet gauche|linkes Handgelenk|左手首|左腕关节
rightWrist|punho direito|muñeca derecha|poignet droit|rechtes Handgelenk|右手首|右腕关节
leftHip|quadril esquerdo|cadera izquierda|hanche gauche|linke Hüfte|左股関節|左髋
rightHip|quadril direito|cadera derecha|hanche droite|rechte Hüfte|右股関節|右髋
leftKnee|joelho esquerdo|rodilla izquierda|genou gauche|linkes Knie|左膝|左膝
rightKnee|joelho direito|rodilla derecha|genou droit|rechtes Knie|右膝|右膝
leftAnkle|tornozelo esquerdo|tobillo izquierdo|cheville gauche|linker Knöchel|左足首|左踝
rightAnkle|tornozelo direito|tobillo derecho|cheville droite|rechter Knöchel|右足首|右踝
Connected pieces|Peças conectadas|Piezas conectadas|Pièces connectées|Verbundene Teile|接続されたパーツ|已连接部件
Follow layer|Seguir camada|Seguir capa|Suivre le calque|Ebene folgen|追従レイヤー|跟随图层
Follow control|Seguir controle|Seguir control|Suivre le contrôle|Steuerelement folgen|追従コントロール|跟随控制器
Whole layer|Camada inteira|Capa completa|Calque entier|Ganze Ebene|レイヤー全体|整个图层
Connect piece|Conectar peça|Conectar pieza|Connecter la pièce|Teil verbinden|パーツを接続|连接部件
Connect selected pieces|Conectar peças selecionadas|Conectar piezas seleccionadas|Connecter les pièces sélectionnées|Ausgewählte Teile verbinden|選択パーツを接続|连接选中部件
Disconnect piece|Desconectar peça|Desconectar pieza|Déconnecter la pièce|Teil trennen|接続を解除|断开部件
Choose a layer…|Escolha uma camada…|Elige una capa…|Choisir un calque…|Ebene auswählen…|レイヤーを選択…|选择图层…
Select character|Selecionar personagem|Seleccionar personaje|Sélectionner le personnage|Figur auswählen|キャラクターを選択|选择角色
Isolate character|Isolar personagem|Aislar personaje|Isoler le personnage|Figur isolieren|キャラクターを分離表示|隔离角色
Duplicate|Duplicar|Duplicar|Dupliquer|Duplizieren|複製|复制
Rename|Renomear|Renombrar|Renommer|Umbenennen|名前を変更|重命名
Delete|Excluir|Eliminar|Supprimer|Löschen|削除|删除
Copy keyframes|Copiar keyframes|Copiar fotogramas clave|Copier les images clés|Keyframes kopieren|キーフレームをコピー|复制关键帧
Paste keyframes|Colar keyframes|Pegar fotogramas clave|Coller les images clés|Keyframes einfügen|キーフレームを貼り付け|粘贴关键帧
Duplicate keyframes|Duplicar keyframes|Duplicar fotogramas clave|Dupliquer les images clés|Keyframes duplizieren|キーフレームを複製|复制关键帧副本
Copy pose|Copiar pose|Copiar pose|Copier la pose|Pose kopieren|ポーズをコピー|复制姿势
Paste pose|Colar pose|Pegar pose|Coller la pose|Pose einfügen|ポーズを貼り付け|粘贴姿势
Fit selection|Enquadrar seleção|Ajustar selección|Cadrer la sélection|Auswahl einpassen|選択に合わせる|适应选区
Fit duration|Enquadrar duração|Ajustar duración|Cadrer la durée|Dauer einpassen|全体の時間に合わせる|适应时长
Frames|Frames|Fotogramas|Images|Frames|フレーム|帧
Playhead|Indicador de tempo|Cabezal|Tête de lecture|Abspielposition|再生ヘッド|播放头
Markers|Marcadores|Marcadores|Marqueurs|Markierungen|マーカー|标记
Keys|Keyframes|Claves|Images clés|Keyframes|キーフレーム|关键帧
Timeline|Timeline|Línea de tiempo|Chronologie|Zeitleiste|タイムライン|时间轴
Auto-key|Auto-key|Clave automática|Clé automatique|Auto-Key|自動キー|自动关键帧
Auto-key records movement|Auto-key grava movimentos|La clave automática graba movimientos|La clé automatique enregistre les mouvements|Auto-Key zeichnet Bewegungen auf|自動キーで動きを記録|自动关键帧记录动作
Project settings|Configurações do projeto|Ajustes del proyecto|Paramètres du projet|Projekteinstellungen|プロジェクト設定|项目设置
Project name|Nome do projeto|Nombre del proyecto|Nom du projet|Projektname|プロジェクト名|项目名称
Width|Largura|Anchura|Largeur|Breite|幅|宽度
Height|Altura|Altura|Hauteur|Höhe|高さ|高度
Frame rate|Taxa de frames|Velocidad de fotogramas|Fréquence d’images|Bildrate|フレームレート|帧率
Save|Salvar|Guardar|Enregistrer|Speichern|保存|保存
Discard|Descartar|Descartar|Ignorer|Verwerfen|破棄|放弃
Export|Exportar|Exportar|Exporter|Exportieren|書き出し|导出
Learn|Aprender|Aprender|Apprendre|Lernen|学ぶ|学习
Find a command|Buscar comando|Buscar comando|Rechercher une commande|Befehl suchen|コマンドを検索|搜索命令
Unsaved changes|Alterações não salvas|Cambios sin guardar|Modifications non enregistrées|Ungespeicherte Änderungen|未保存の変更|未保存的更改
Project saved|Projeto salvo|Proyecto guardado|Projet enregistré|Projekt gespeichert|保存済み|项目已保存
Ready|Pronto|Listo|Prêt|Bereit|準備完了|就绪
Preview|Prévia|Vista previa|Aperçu|Vorschau|プレビュー|预览
Full|Completa|Completa|Complète|Voll|フル|完整
Half|Metade|Mitad|Moitié|Halb|半分|一半
Quarter|Um quarto|Un cuarto|Quart|Viertel|4分の1|四分之一
Position X|Posição X|Posición X|Position X|Position X|位置 X|位置 X
Position Y|Posição Y|Posición Y|Position Y|Position Y|位置 Y|位置 Y
Rotation|Rotação|Rotación|Rotation|Drehung|回転|旋转
Scale X|Escala X|Escala X|Échelle X|Skalierung X|拡大率 X|缩放 X
Scale Y|Escala Y|Escala Y|Échelle Y|Skalierung Y|拡大率 Y|缩放 Y
Opacity|Opacidade|Opacidad|Opacité|Deckkraft|不透明度|不透明度
Move|Mover|Mover|Déplacer|Verschieben|移動|移动
Rotate|Girar|Rotar|Tourner|Drehen|回転|旋转
Scale|Escalar|Escalar|Redimensionner|Skalieren|拡大縮小|缩放
Done|Concluir|Listo|Terminé|Fertig|完了|完成
Import artwork|Importar arte|Importar ilustración|Importer une illustration|Grafik importieren|画像を読み込む|导入图稿
Remove pin|Remover pin|Eliminar pin|Supprimer le point|Pin entfernen|ピンを削除|删除图钉
Remove bone|Remover osso|Eliminar hueso|Supprimer l’os|Knochen entfernen|ボーンを削除|删除骨骼
Bone angle|Ângulo do osso|Ángulo del hueso|Angle de l’os|Knochenwinkel|ボーン角度|骨骼角度
Pin X|Pin X|Pin X|Point X|Pin X|ピン X|图钉 X
Pin Y|Pin Y|Pin Y|Point Y|Pin Y|ピン Y|图钉 Y
Strength|Força|Fuerza|Force|Stärke|強さ|强度
Influence radius|Raio de influência|Radio de influencia|Rayon d’influence|Einflussradius|影響半径|影响半径
Undo|Desfazer|Deshacer|Annuler|Rückgängig|元に戻す|撤销
Redo|Refazer|Rehacer|Rétablir|Wiederholen|やり直す|重做
First frame|Primeiro frame|Primer fotograma|Première image|Erster Frame|最初のフレーム|第一帧
Last frame|Último frame|Último fotograma|Dernière image|Letzter Frame|最後のフレーム|最后一帧
Loop playback|Repetir reprodução|Repetir reproducción|Lecture en boucle|Wiedergabe wiederholen|ループ再生|循环播放
Add marker|Adicionar marcador|Añadir marcador|Ajouter un marqueur|Markierung hinzufügen|マーカーを追加|添加标记
Curve editor|Editor de curvas|Editor de curvas|Éditeur de courbes|Kurveneditor|カーブエディター|曲线编辑器
Format|Formato|Formato|Format|Format|形式|格式
Resolution|Resolução|Resolución|Résolution|Auflösung|解像度|分辨率
Current shot|Cena atual|Escena actual|Plan actuel|Aktuelle Szene|現在のショット|当前镜头
Complete production|Produção completa|Producción completa|Production complète|Gesamte Produktion|作品全体|完整作品
Transparent background|Fundo transparente|Fondo transparente|Fond transparent|Transparenter Hintergrund|透明背景|透明背景
Add to render queue|Adicionar à fila de render|Añadir a la cola de renderizado|Ajouter à la file de rendu|Zur Renderwarteschlange hinzufügen|レンダーキューに追加|添加到渲染队列
Render queue|Fila de render|Cola de renderizado|File de rendu|Renderwarteschlange|レンダーキュー|渲染队列
Use a time range|Usar intervalo de tempo|Usar intervalo de tiempo|Utiliser une plage de temps|Zeitbereich verwenden|時間範囲を指定|使用时间范围
From|De|Desde|De|Von|開始|从
To|Até|Hasta|À|Bis|終了|到
This project has unsaved changes.|Este projeto tem alterações não salvas.|Este proyecto tiene cambios sin guardar.|Ce projet contient des modifications non enregistrées.|Dieses Projekt hat ungespeicherte Änderungen.|このプロジェクトには未保存の変更があります。|此项目有未保存的更改。
Assign a torso and use each layer only once.|Associe um tronco e use cada camada apenas uma vez.|Asigna un tronco y usa cada capa una sola vez.|Associez un torse et utilisez chaque calque une seule fois.|Ordnen Sie einen Rumpf zu und verwenden Sie jede Ebene nur einmal.|胴体を割り当て、各レイヤーは一度だけ使用してください。|请分配躯干，每个图层只能使用一次。
These pieces already have a rig or animation. Enable work on a copy.|Estas peças já têm rig ou animação. Ative trabalhar numa cópia.|Estas piezas ya tienen rig o animación. Activa trabajar en una copia.|Ces pièces ont déjà un rig ou une animation. Activez le travail sur une copie.|Diese Teile haben bereits ein Rig oder eine Animation. Aktivieren Sie die Kopie.|既存のリグやアニメーションがあります。コピーで作業してください。|这些部件已有绑定或动画，请启用副本操作。
Unlock the selected pieces before connecting them.|Desbloqueie as peças antes de conectá-las.|Desbloquea las piezas antes de conectarlas.|Déverrouillez les pièces avant de les connecter.|Entsperren Sie die Teile vor dem Verbinden.|接続する前にパーツのロックを解除してください。|连接前请解锁部件。
`;
export const catalogs:Record<Locale,Record<string,string>>=messages;
export type MessageKey=keyof typeof messages.en;
let locale:Locale=readPreferences().locale;
export function setLocale(value:Locale){locale=value;document.documentElement.lang=value;}
export function t(key:MessageKey):string{return catalogs[locale][key]??key;}
export function tr(text:string):string{if(catalogs[locale][text])return catalogs[locale][text];if(text.endsWith(' ·'))return tr(text.slice(0,-2))+' ·';const upper=text.toUpperCase();if(text===upper&&/[A-Z]/.test(text)){const title=text.toLowerCase().replace(/\b\w/g,c=>c.toUpperCase());if(catalogs[locale][title])return catalogs[locale][title];}const parts=text.split(' · ');if(parts.length>1)return parts.map(p=>tr(p)).join(' · ');return text;}
export function currentLocale(){return locale;}
