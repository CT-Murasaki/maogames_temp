exports.main = void 0;

function main(param) {
	g.game.pushScene(makescene(param));
}

function makescene(param) {

    const debugmode = false;

    let scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのIDを列挙し、シーンに通知します
        assetIds: [
            "title",
            "font_round",
            "font_round_glyphs",
            "haikei",
            "body1",
            "body2",
            "body3",
            "body4",
            "body5",
            "body6",
            "body7",
            "body8",
            "yuzai",
            "muzai",
            "bgm",
            "se_start",
            "se_seikai",
            "se_seikai2",
            "se_hazure",
            "se_finish1",
            "se_finish2"
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
        let resultstate = false;
        let resultclose = false;
        let waitthen = false;
        let finishstate = false;
        let myhp = 9999;
        let partsId = 0;
        let Nextparts = 0;
        
        let bodyNo = 1;
        let bodytotal = 6;
        let waittime = 0;
        let hitpoint = (bodytotal - 1) * 10;

        // レイヤーの生成
        let startlayer = new g.E({ scene: scene, parent: scene });  //スタート画面
        let backlayer = new g.E({ scene: scene, parent: scene });   //背景
        let bodylayer = new g.E({ scene: scene, parent: scene });   //体(押すとはずれ)
        let buttonlayer = new g.E({ scene: scene, parent: scene}); //ターゲットレイヤー(映らない)
        let resultlayer = new g.E({ scene: scene, parent: scene}); //結果表示
        let resultlayer2 = new g.E({ scene: scene, parent: scene}); //結果表示
        
        // フォントの生成
        let glyph1 = JSON.parse(scene.assets["font_round_glyphs"].data);
        let font1 = new g.BitmapFont({src: scene.assets["font_round"],
            map:glyph1,defaultGlyphWidth: 96, defaultGlyphHeight: 96});
        let font = new g.DynamicFont({
            game: g.game,
            fontFamily: "sans-serif",
            size: 45
          });
          

        //タイトル画面
        let startimage = new g.FrameSprite({scene: scene, src: scene.assets["title"], parent: startlayer,
            x: g.game.width/2, y: g.game.height/2, anchorX: 0.5, anchorY: 0.5, opacity: 1, touchable: true});
        //クリックするとスタートするようにする
        startimage.onPointDown.add(function () {if (warmup < 10){
            startstate = true
            scene.assets["se_start"].play().changeVolume(0.6);
            scene.assets["bgm"].play().changeVolume(0.3);
        }});

        // 自HP表示用のラベル
        let myhpLabel = new g.Label({parent: backlayer, scene: scene, text: "HP:" + myhp,
            font: font1, fontSize: font1.size / 2, textColor: "dimgray", opacity: 0});
        scene.append(myhpLabel);

        // 残り時間表示用ラベル
        let timeLabel = new g.Label({parent: backlayer,scene: scene,text: "TIME: " + 60, 
            font: font1, fontSize: font1.size / 2, textColor: "dimgray", x: 0.65 * g.game.width,opacity: 0});
        scene.append(timeLabel);

        //背景画像
        let background = new g.FrameSprite({scene: scene, src: scene.assets["haikei"], parent: backlayer,
            x: g.game.width/2, y: g.game.height/2,anchorX: 0.5, anchorY: 0.5, opacity: 0});

        // ターゲット表示用ラベル
        //体
        let backbody = new g.FrameSprite({scene: scene, src: scene.assets["body" + bodyNo], parent: bodylayer,
            x: g.game.width/2, y: g.game.height/2,anchorX: 0.5, anchorY: 0.5, opacity: 0, touchable: false});
        
        //ターゲットラベル
        let t_list = [];
        let t_str = ["","シャツ袖(左)","シャツ袖(右)","シャツ(むね)","短パン","タイツ(左)","タイツ(右)"]
        partsId = getrandom(1, 6, -1);
        Nextparts = getrandom(1, 6, partsId);
        let t_int = partsId;
        let t_hp = getrandom(1, 4, -1);
        let Nexthp = getrandom(1, 4, -1);
        t_list[1] = [392,247,121,148] //シャツ(左)
        t_list[2] = [624,247,112,150] //シャツ(右)
        t_list[3] = [495,236,144,158] //シャツ(むね)
        t_list[4] = [469,392,199,163] //短パン
        t_list[5] = [476,554,93,164] //ひだりあし
        t_list[6] = [576,554,93,164] //みぎあし
        let find = new g.FilledRect({scene: scene,x:t_list[t_int][0], y:t_list[t_int][1], width: t_list[t_int][2], height:t_list[t_int][3], 
            cssColor: "black", parent: buttonlayer, opacity: 0});
        scene.append(find);
       
        //体を触ると減点
        backbody.onPointDown.add(function(){
            if (waitthen == false){
                scene.assets["se_hazure"].play().changeVolume(0.6);
                myhp -= getrandom(1000,2000,-1);
                if (myhp < 0){
                    backbody.src = scene.assets["body8"];
                    resultstate = true;
                    myhp = 0;
                    scene.assets["se_finish2"].play().changeVolume(0.6);
                }
                myhpLabel.text = "HP:" + myhp;
            }
        });

        //ターゲットを触るとスコアアップ
        find.onPointDown.add(function(){
            hitpoint -= 1;
            t_hp -= 1;

            if (hitpoint % 10 == 0 && hitpoint != 0){
                bodyNo += 1;
                backbody.src = scene.assets["body" + bodyNo];
                waitthen = true;
                backbody.touchable = false;
                switch (bodyNo){
                    case 3:
                        t_list[1] = [406,250,106,129];
                        t_list[2] = [630,276,76,122];
                        t_list[4] = [500,400,161,154];
                        t_list[5] = [475,497,86,227];
                        break;

                    case 4:
                        t_list[1] = [446,327,69,72];

                        t_str[2] = "シャツ(左むね)";
                        t_list[2] = [499,259,56,129];
    
                        t_str[3] = "シャツ(右むね)";
                        t_list[3] = [568,231,75,155];
    
                        t_str[4] = "ぱんつ";
                        t_list[4] = [481,453,166,52];
    
                        t_list[5] = [476,562,83,159];
                        t_list[6] = [572,567,85,147];
                        break;

                    case 5:
                        t_str[1] = "さきっちょ(左)";
                        t_list[1] = [506,291,18,37];
    
                        t_str[2] = "さきっちょ(右)";
                        t_list[2] = [612,289,20,38];
    
                        t_str[3] = "ぱんつ";
                        t_list[3] = [511,464,102,42];
                        break;
                }

                if (bodyNo == 5){
                    partsId = getrandom(1, 3, -1);
                    Nextparts = getrandom(1, 3, partsId);
                    t_int = partsId;
                }
                else{
                    partsId = getrandom(1, 6, -1);
                    Nextparts = getrandom(1, 6, partsId);
                    t_int = partsId;
                }

                t_hp = getrandom(1, 4, -1);
                Nexthp = getrandom(1, 4, -1);
                find.x = t_list[t_int][0];
                find.y = t_list[t_int][1];
                find.width = t_list[t_int][2];
                find.height = t_list[t_int][3];
                scene.assets["se_seikai2"].play().changeVolume(0.6);
            }
            else if (hitpoint == 0){
                bodyNo += 1;
                backbody.src = scene.assets["body" + bodyNo];
                resultstate = true;
                scene.assets["se_finish1"].play().changeVolume(0.6);
            }
            else{
                scene.assets["se_seikai"].play().changeVolume(0.6);
            }

            if (t_hp == 0){
                t_int = Nextparts
                t_hp = Nexthp;
                find.x = t_list[t_int][0];
                find.y = t_list[t_int][1];
                find.width = t_list[t_int][2];
                find.height = t_list[t_int][3];
                if (bodyNo == 5){
                    Nextparts = getrandom(1, 3, t_int);
                }
                else{
                    Nextparts = getrandom(1, 6, t_int);
                }
                Nexthp = getrandom(1, 4, -1);
            }
            
            
        });

        // ターゲット名称ラベルヘッダー
        let TargetHeder = new g.Label({parent: backlayer,scene: scene,text: "Target", font: font1,
            fontSize: font1.size / 2, textColor: "darkorange", y: 0.40 * g.game.height, opacity: 0});
        scene.append(TargetHeder);

        // ターゲット名称ラベル
        let TargetLabel = new g.Label({parent: backlayer,scene: scene,text: getbodyName(t_str[t_int],t_hp), font: font,
            fontSize: font.size , textColor: "black", y: 0.50 * g.game.height, opacity: 0});
        scene.append(TargetLabel);
    
        // 次ターゲット名称ラベルヘッダー
        let NextHerder = new g.Label({parent: backlayer,scene: scene,text: "Next", font: font1,
            fontSize: font1.size / 2, textColor: "darkorange", y: 0.60 * g.game.height, opacity: 0});
        scene.append(NextHerder);

        // 次ターゲット名称ラベル
        let NextLabel = new g.Label({parent: backlayer,scene: scene,text: getbodyName(t_str[Nextparts],Nexthp), font: font,
            fontSize: font.size , textColor: "black", y: 0.70 * g.game.height, opacity: 0});
        scene.append(NextLabel);

        // リザルト
        let resultLabel = new g.FilledRect({scene: scene,x: g.game.width/2, y: g.game.height/2,anchorX: 0.65, anchorY: 0.4,
            width: g.game.width/2, height: g.game.height/2, cssColor: "black", parent: resultlayer, opacity: 0});
        scene.append(resultLabel);

        let destLabel = new g.Label({parent: resultlayer,scene: scene,text: "装甲破壊率         " + 100.0, font: font,
            textColor: "lavender",fontSize: font.size , x: g.game.width/3.5, y: g.game.height/2.5, opacity: 0});
        scene.append(destLabel);

        let t_bonusLabel = new g.Label({parent: resultlayer,scene: scene,text: "タイムボーナス   " + 10, font: font,
            textColor: "lavender", fontSize: font.size , x: g.game.width/3.5, y: g.game.height/2.5, anchorY: -1.5, opacity: 0});
        scene.append(t_bonusLabel);

        let l_bonusLabel = new g.Label({parent: resultlayer,scene: scene,text: "ライフボーナス   " + 10, font: font,
        textColor: "lavender",fontSize: font.size , x: g.game.width/3.5, y: g.game.height/2.5, anchorY: -3, opacity: 0});
        scene.append(l_bonusLabel);

        let cleseLabel = new g.FilledRect({parent: resultlayer2,scene: scene,touchable: false,width: 70, height: 70,
            cssColor: "red", x: g.game.width/1.8, y: g.game.height/1.7, anchorX: -1.2, anchorY: 3, opacity: 0});
        scene.append(cleseLabel);

        let cleseText = new g.Label({parent: resultlayer2,scene: scene,text: "✖", font: font,touchable: false,
        textColor: "lavender",fontSize: font.size , x: g.game.width/1.6, y: g.game.height/2, anchorX: -0.3, anchorY: 3, opacity: 0});
        scene.append(cleseText);
        cleseLabel.onPointDown.add(function(){
            resultclose = true;
        })

        let sinImage = new g.FrameSprite({scene: scene, src: scene.assets["yuzai"], parent: resultlayer2,
        x: g.game.width/4, y: g.game.height/2,anchorX: 0.65, anchorY: 0.35, opacity: 0, touchable: false});

        //一括処理用
        let mainObj = [background,myhpLabel,timeLabel,backbody,
                        TargetHeder,TargetLabel,NextHerder,NextLabel];
        let TargetObj = [TargetHeder,TargetLabel,NextHerder,NextLabel,myhpLabel,timeLabel];
        let resultObj = [destLabel,t_bonusLabel,l_bonusLabel,cleseText];
        let RectObj = [find,resultLabel,cleseLabel]

        // ■■■■■■■■■■■■　 メイン描画　　■■■■■■■■■■■■
        scene.onUpdate.add(function () {//時間経過
            if (waitthen == true){
                waittime += 1 / g.game.fps;
                if (waittime >= 1){
                    waitthen = false;
                    waittime = 0;
                    backbody.touchable = true;
                }
            }

            if (startstate == true && finishstate == false && resultstate == false) { 
                gametime += 1 / g.game.fps; 

                startimage.opacity = 0;
                startimage.touchable = false;
                mainObj.forEach(function(Obj){Obj.opacity = 1;});
                if (debugmode == true){find.opacity = 0.5;}
                backbody.touchable = true;
                find.touchable = true;
                TargetLabel.text = getbodyName(t_str[t_int],t_hp);
                NextLabel.text = getbodyName(t_str[Nextparts],Nexthp);

                if (gametime >= 60){
                    gametime = 60;
                    backbody.src = scene.assets["body8"];
                    resultstate = true;
                    scene.assets["se_finish2"].play().changeVolume(0.3);
                }
                else{
                    timeLabel.text = "TIME: " + String((Math.floor((60 - gametime) * 10) / 10));
                };
            } 
            else if (finishstate == true){
                startstate = false
                backbody.touchable = false;
                find.touchable = false;
                startimage.opacity = 0;
                find.opacity = 0;
                startimage.touchable = false;
                mainObj.forEach(function(Obj){Obj.opacity = 0;});
            }
            else if (resultstate == true){
                startstate = false
                backbody.touchable = false;
                find.touchable = false;
                find.opacity = 0;
                TargetObj.forEach(function(Obj){Obj.opacity = 0;});

                let destint;
                let t_bonus
                let l_bonus
                let tmpint = ((bodytotal - 1) * 10) - hitpoint
                if (tmpint == 0){
                    destint = 0;
                    destLabel.text = "装甲破壊率         " + "0";
                    t_bonus = 0;
                    t_bonusLabel.text = "タイムボーナス   " +  "0";
                    l_bonus = 0;
                    l_bonusLabel.text = "ライフボーナス   " + "0";
                }
                else{
                    destint = (tmpint / ((bodytotal - 1) * 10)) * 100;
                    destLabel.text = "装甲破壊率         " + String((Math.floor((destint) * 10) / 10));
                    t_bonus = Math.floor((60 -gametime) * 10) / 10;
                    t_bonusLabel.text = "タイムボーナス   " + String(t_bonus);
                    l_bonus = Math.floor((myhp / 1000) * 10) / 10;
                    l_bonusLabel.text = "ライフボーナス   " + String(l_bonus);
                }
                if (destint == 100){
                    sinImage.src = scene.assets["yuzai"];
                }
                else{
                    sinImage.src = scene.assets["muzai"];
                }
                g.game.vars.gameState.score = Math.floor((destint + t_bonus + l_bonus) * 10);

                cleseLabel.opacity = 0
                cleseLabel.touchable = true;
                sinImage.opacity = 1;
                if (resultclose == true){
                    resultObj.forEach(function(Obj){Obj.opacity = 0;});
                    resultLabel.opacity = 0;
                    bodyNo += 1;
                    if (destint == 100){
                        backbody.src = scene.assets["body7"];
                    }
                }
                else{
                    resultLabel.opacity = 0.5;
                    resultObj.forEach(function(Obj){Obj.opacity = 1;});
                }
            }
            else
            {
                warmup += 1 / g.game.fps;
                if (warmup < 10){
                    startimage.opacity = 1;
                }
                else{
                    finishstate = true
                };
            };

            startimage.invalidate();
            sinImage.invalidate();
            RectObj.forEach(function(Obj){Obj.modified();});
            mainObj.forEach(function(Obj){Obj.invalidate();});
            resultObj.forEach(function(Obj){Obj.invalidate();});
        });
    });
    // ここまでゲーム内容を記述します
    return scene;
};
exports.main = main;

function getrandom(min,max,exc){
    let int = g.game.random.get(min, max);
    while(exc != -1 && exc == int){
        int = g.game.random.get(min, max);
    }
    return int
}

function getbodyName(str,hp){
    let bodyName = str;
    if(hp != 1){
        bodyName = str + "×" + String(hp);
    }
    return bodyName;
}

