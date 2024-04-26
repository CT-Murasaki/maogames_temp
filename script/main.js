exports.main = void 0;

function main(param) {
	g.game.pushScene(makescene(param));
}

function makescene(param) {

    let scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのIDを列挙し、シーンに通知します
        assetIds: [
            "title",
            "font_round",
            "font_round_glyphs",
            "find",
            "haikei",
            "body1",
            "body2",
            "body3",
            "body4",
            "body5",
            "body6",
            "body7",
            "body8",
			//音声ファイルはhttps://github.com/akashic-contents　CC BY 2.1 JP　DWANGO Co., Ltd.
            "bgm",
            "se_start",
            "se_seikai",
            "se_hazure",
            "se_finish",
	    ]
    });

    // 市場コンテンツのランキングモードでは、g.game.vars.gameState.score の値をスコアとして扱います
    g.game.vars.gameState = { score: 0 };

    scene.onLoad.add(function () {
        // ここからゲーム内容を記述します
        //■■■■■■■■■■■■　 変数　レイヤー　フォント 　■■■■■■■■■■■■

        let gametime = 0; // ゲーム時間測定
        let warmup = 0; //ゲーム開始猶予
        let startstate = false;
        let finishstate = true;
        let score = 0;
        
        let bodyNo = 1;
        let bodytotal = 6;
        let findkind = 2;

        // レイヤーの生成
        let startlayer = new g.E({ scene: scene, parent: scene });  //スタート画面
        let backlayer = new g.E({ scene: scene, parent: scene });   //背景
        let bodylayer = new g.E({ scene: scene, parent: scene });   //体(押すとはずれ)
        let buttonlayer = new g.E({ scene: scene, parent: scene }); //ターゲットレイヤー(映らない)
        
        // フォントの生成
        let glyph = JSON.parse(scene.assets["font_round_glyphs"].data);
        let font = new g.BitmapFont({src: scene.assets["font_round"],
            map:glyph,defaultGlyphWidth: 96,defaultGlyphHeight: 96,});

        //タイトル画面
        let startimage = new g.FrameSprite({scene: scene, src: scene.assets["title"], parent: startlayer,
            x: g.game.width/2, y: g.game.height/2,anchorX: 0.5, anchorY: 0.5, opacity: 1, touchable: true});
        //クリックするとスタートするようにする
        startimage.onPointDown.add(function () {if (warmup < 10){
            startstate = true
        }});

        // スコア表示用のラベル
        let scoreLabel = new g.Label({parent: backlayer, scene: scene,text: "SCORE: 0",
            font: font,fontSize: font.size / 2,textColor: "black",opacity: 0});
        scene.append(scoreLabel);

        // 残り時間表示用ラベル
        let timeLabel = new g.Label({parent: backlayer,scene: scene,text: "TIME: " + 60,font: font,fontSize: 
            font.size / 2,textColor: "black",x: 0.65 * g.game.width,opacity: 0});
        scene.append(timeLabel);

        //背景画像
        let background = new g.FrameSprite({scene: scene, src: scene.assets["haikei"], parent: backlayer,
            x: g.game.width/2, y: g.game.height/2,anchorX: 0.5, anchorY: 0.5, opacity: 0});

        // ターゲット表示用ラベル
        //体
        let backbody = new g.FrameSprite({scene: scene, src: scene.assets["body" + bodyNo], parent: bodylayer,
            x: g.game.width/2, y: g.game.height/2,anchorX: 0.5, anchorY: 0.5, opacity: 0, touchable: false});
        //ターゲットラベル
        let find = new g.Sprite({scene: scene, src: scene.assets["find"], parent: buttonlayer,
            x: g.game.width/2, y: g.game.height/2, opacity: 0, touchable: false});
       
        //体を触ると減点
        backbody.onPointDown.add(function(){
            score -= 50; 
            scene.assets["se_hazure"].play().changeVolume(0.6);
        });

        //ターゲットを触るとスコアアップ
        find.onPointDown.add(function(){
            score += 50; 
            scene.assets["se_seikai"].play().changeVolume(0.6);
        });

        let mainObj = [startimage,scoreLabel,timeLabel,backbody,find];

        let targetLabel = [];
        let nextLabel = [];

        // ■■■■■■■■■■■■　 メイン描画　　■■■■■■■■■■■■
        scene.onUpdate.add(function () {//時間経過
            warmup += 1 / g.game.fps;
            if (startstate == true) { 
                startimage.opacity = 0;
                gametime += 1 / g.game.fps; 

                if (gametime <= 60){
                    scoreLabel.opacity = 1;
                    scoreLabel.text = "SCORE: " + score;
                    timeLabel.opacity = 1;
                    timeLabel.text = "TIME: " + Math.ceil(60 -gametime);
                    background.opacity = 1;
                }
                else{

                };
            } 
            else
            {
                if (warmup < 20){
                    startimage.opacity = 1;
                }
                else{
                    startimage.opacity = 0; startimage.touchable = false;
                };
            };
            mainObj.forEach(function(Obj){
                Obj.invalidate();
            });
        });
        // ここまでゲーム内容を記述します

    // g.game.pushScene(scene);
    return scene;
    })
}


function backbodyAdd(scene,bodylayer,bodyNo){
    let backbody = new g.FrameSprite({ //体
        scene: scene, src: scene.assets["body" + bodyNo], parent: bodylayer,
        x: g.game.width/2, y: g.game.height/2,
        anchorX: 0.5, anchorY: 0.5, opacity: 0
    });
    backbody.onPointDown.add(function(){
        if (backbody.opacity = 1){
            g.game.vars.gameState.score -= 50;
            scene.assets["se_hazure"].play().changeVolume(0.6);
        }
    })
    return backbody;
}


function targetAdd(scene,backlayer,font,str,cnt,next){
    let text;
    if (cnt == 1){
        text = str;
    }
    else{
        text = str + "x" + cnt;
    }

    let y;
    if (next == true){
        y = 0.3;
    }
    else{
        y = 0.2;
    }
    let targetLabel = new g.Label({
        parent: backlayer,
        scene: scene,
        text: text,
        font: font,
        fontSize: font.size / 2,
        textColor: "black",
        x: 0.65 * g.game.width,
        y: y * g.game.height,
        opacity: 0
    });
    return targetLabel;
}
exports.main = main;
