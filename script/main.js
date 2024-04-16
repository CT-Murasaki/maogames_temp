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
            "find1",
            "find2",
            "find3",
            "haikei",
            "body1",
            "body2",
            "body3",
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

        let gametime = 0; // ゲーム時間
        let warmup = 0;
        let startstate = false;
        let finishstate = true;
        
        let bodyNo = 1;
        let bodytotal = 3;
        let findkind = 2;

        let findnames = [
            [["むね",g.game.random.get(1, 4)],["ふともも",g.game.random.get(1, 4)],["おなか",g.game.random.get(1, 4)]],
            [["むね",g.game.random.get(1, 4)],["ふともも",g.game.random.get(1, 4)],["おなか",g.game.random.get(1, 4)]],
            [["むね",g.game.random.get(1, 4)],["ふともも",g.game.random.get(1, 4)],["おなか",g.game.random.get(1, 4)]],
        ];

        let findcoordinates =[
            [g.game.width*0.46,g.game.height*0.35],
            [g.game.width*0.36,g.game.height*0.25],
            [g.game.width*0.26,g.game.height*0.15]
        ];


        // レイヤーの生成
        let startlayer = new g.E({ scene: scene, parent: scene });
        let backlayer = new g.E({ scene: scene, parent: scene }); 
        let bodylayer = new g.E({ scene: scene, parent: scene });
        let buttonlayer = new g.E({ scene: scene, parent: scene });
        
        

        // フォントの生成
        let glyph = JSON.parse(scene.assets["font_round_glyphs"].data);
        let font = new g.BitmapFont({
            src: scene.assets["font_round"],
            map: glyph,
            defaultGlyphWidth: 96,
            defaultGlyphHeight: 96,
        });


        // ■■■■■■■■■■■■　 開始処理　　■■■■■■■■■■■■
        let startimage = new g.FrameSprite({ //背景
            scene: scene, src: scene.assets["title"], parent: startlayer,
            x: g.game.width/2, y: g.game.height/2,
            anchorX: 0.5, anchorY: 0.5, opacity: 1, touchable: true
        });
        startimage.onPointDown.add(function () {
            if (warmup < 10){
                startstate = true
            }
        })

        // ■■■■■■■■■■■■　 メイン描画　　■■■■■■■■■■■■
        // スコア表示用のラベル
        let scoreLabel = new g.Label({
            parent: backlayer,
            scene: scene,
            text: "SCORE: 0",
            font: font,
            fontSize: font.size / 2,
            textColor: "black",
            opacity: 0
        });
        scene.append(scoreLabel);
        // 残り時間表示用ラベル
        let timeLabel = new g.Label({
            parent: backlayer,
            scene: scene,
            text: "TIME: " + 60,
            font: font,
            fontSize: font.size / 2,
            textColor: "black",
            x: 0.65 * g.game.width,
            opacity: 0
        });
        // ターゲット表示用ラベル
        scene.append(timeLabel);
        let background = new g.FrameSprite({ //背景
            scene: scene, src: scene.assets["haikei"], parent: backlayer,
            x: g.game.width/2, y: g.game.height/2,
            anchorX: 0.5, anchorY: 0.5, opacity: 0
        });
        let backbody = [];
        let find = [];
        let targetLabel = [];
        let nextLabel = [];
        if (startstate == false){
            for (let i = 1; i <= bodytotal ; i++) {//入れ替え　代入
                backbody[i] = backbodyAdd(scene,bodylayer,i);
                find[i] = findAdd(scene,buttonlayer,i,findcoordinates);
                for (let targetID = 0; targetID <= findkind ; targetID++) {
                    targetLabel[i,targetID] = targetAdd(scene,backlayer,font,findnames[i - 1,0],findnames[i - 1,1],false)
                    scene.append(targetLabel[i,targetID]);
                    nextLabel[i,targetID] = targetAdd(scene,backlayer,font,findnames[i - 1,0],findnames[i - 1,1],true)
                    scene.append(nextLabel[i,targetID]);
                }
                find[i].onPointDown.add(function(){
                    if (find.opacity = 1){
                        g.game.vars.gameState.score += 50;
                        bodyNo += 1;
                        scene.assets["se_seikai"].play().changeVolume(0.4);
                    }
                })
            }
        }

        scene.onUpdate.add(function () {//時間経過
            warmup += 1 / g.game.fps;
            if (startstate) { 
                startimage.opacity = 0;

                gametime += 1 / g.game.fps; 

                scoreLabel.opacity = 1;
                scoreLabel.text = "SCORE: " + g.game.vars.gameState.score;
                timeLabel.opacity = 1;
                timeLabel.text = "TIME: " + Math.ceil(60 -gametime);
                background.opacity = 1;
                let target_select = g.game.random.get(0, findkind);
                let next_select;
                while(true){
                    next_select = g.game.random.get(0, findkind);
                    if (next_select != target_select){
                        break;
                    }
                }
                for (let i = 1; i <= bodytotal ; i++) {
                    if (i == bodyNo){
                        backbody[i].opacity = 1;
                        backbody[i].touchable = true;
                        find[i].opacity = 1;
                        find[i].touchable = true;
                        for (let targetID = 0; targetID <= findkind ; targetID++) {
                            if (target_select == targetID){
                                targetLabel[i,targetID].opacity = 1;
                            }
                            else{
                                targetLabel[i,targetID].opacity = 0;
                            }
                            if (next_select == targetID){
                                nextLabel[i,targetID].opacity = 1;
                            }
                            else{
                                nextLabel[i,targetID].opacity = 0;
                            }
                        }

                    }
                    else{
                        backbody[i].opacity = 0;
                        backbody[i].touchable = false;
                        find[i].opacity = 0;
                        find[i].touchable = false;

                        for (let targetID = 0; targetID <= findkind ; targetID++) {
                            targetLabel[i,targetID].opacity = 0;
                            nextLabel[i,targetID].opacity = 0;
                        }
                    }
                    backbody[i].invalidate();
                    find[i].invalidate();
                    for (let targetID = 0; targetID <= findkind ; targetID++) {
                        targetLabel[i,targetID].invalidate();
                        nextLabel[i,targetID].invalidate();
                    }
                }
            } 
            else
            {
                startimage.opacity = 1;
            }
            startimage.modified();
            scoreLabel.invalidate();
            timeLabel.invalidate();
            background.invalidate();
        })
        // ここまでゲーム内容を記述します
    });

    // g.game.pushScene(scene);
    return scene;
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

function findAdd(scene,buttonlayer,bodyNo,findcoordinates){
    let find = new g.Sprite({
        scene: scene, src: scene.assets["find" + bodyNo], parent: buttonlayer,
        x: findcoordinates[bodyNo - 1][0], y: findcoordinates[bodyNo - 1][1],
        opacity: 0,
    });
    return find;
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
