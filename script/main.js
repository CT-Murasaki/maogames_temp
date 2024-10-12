exports.main = void 0;

function main(param) {
	g.game.pushScene(makescene(param));
}

function makescene(param) {

    const debugmode = false;

    //■■■■■■■■■■■■　 変数　レイヤー　フォント 　■■■■■■■■■■■■
    let warmup = 0; //ゲーム開始猶予
    let gamestate = false;
    let waitthen = false;
    let resultstate = false;
    let watchThen = false;
    let yuzaiThen = false;

    let gameImages = [];
    let gameSteates = [];
    let gameResults = [];
    let gameOmake = [];

    let myhp = 9999;
    let partsId = 0;
    let Nextparts = 0;
    let gametime = 0; // ゲーム時間測定
    
    let bodyNo = 1;
    let bodytotal = 7;
    let hp_max = 4;
    let hitpoint = (bodytotal - 1) * 10;

    let startWait = 0;
    let waittime = 0;


    let scene = new g.Scene({
        game: g.game,
        // このシーンで利用するアセットのIDを列挙し、シーンに通知します
        assetIds: ["title","font_round","font_round_glyphs","haikei","haikei_kapu","haikei_kapu2",
            "body1", "body2", "body3", "body4", "body5", "body6", "body7", "body8","body9", "kiri","kiri_mono",
            "megane","megane_button","result_button","yazi_migi","yazi_hidari","yuzai","muzai",
            "bgm","se_start","se_seikai","se_seikai2","se_hazure","se_finish1","se_finish2",
            //"damage",
            //"bo_finish1",
            //"bo_finish2"
	    ]
    });



    // 市場コンテンツのランキングモードでは、g.game.vars.gameState.score の値をスコアとして扱います
    g.game.vars.gameState = { score: 0 };
    scene.onLoad.add(function () {
        // ここからゲーム内容を記述します
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
        let startimage = new g.FrameSprite({scene: scene, src: scene.assets["title"],
            x: g.game.width/2, y: g.game.height/2, anchorX: 0.5, anchorY: 0.5,touchable: true});
        scene.append(startimage);
        
        //背景画像
        let background = new g.FrameSprite({scene: scene, src: scene.assets["haikei"],
            x: g.game.width/2, y: g.game.height/2,anchorX: 0.5, anchorY: 0.5, hidden : true});
        scene.append(background);
        gameImages.push(background);

        // 自HP表示用のラベル
        let myhpLabel = new g.Label({scene: scene, text: "HP:" + myhp,
            font: font1, fontSize: font1.size / 2, textColor: "dimgray", hidden : true});
        scene.append(myhpLabel);
        gameSteates.push(myhpLabel);

        // 残り時間表示用ラベル
        let timeLabel = new g.Label({scene: scene,text: "TIME: " + 60, 
            font: font1, fontSize: font1.size / 2, textColor: "dimgray", x: 0.65 * g.game.width,hidden : true});
        scene.append(timeLabel);
        gameSteates.push(timeLabel);

        //カプセル魚君
        let kapuseruground = new g.FrameSprite({scene: scene, src: scene.assets["haikei_kapu"],
            x: 770, y: 60, hidden : true});
        scene.append(kapuseruground);
        gameImages.push(kapuseruground);

        let kapuseruground2 = new g.FrameSprite({scene: scene, src: scene.assets["haikei_kapu2"],
            x: 770, y: 60, hidden : true});
        scene.append(kapuseruground2);

        //ターゲットラベル
        let t_list = createTargetList(1);
        let t_str = crateTargetStr(1);
        partsId = getrandom(1, 6, -1);
        Nextparts = getrandom(1, 6, partsId);
        let t_int = partsId;
        let t_hp = getrandom(1, hp_max, -1);
        let Nexthp = getrandom(1, hp_max, -1);

        // ターゲット表示用ラベル
        //体
        let backbody = new g.FrameSprite({scene: scene, src: scene.assets["body" + bodyNo],
            x: g.game.width/2, y: g.game.height/2,anchorX: 0.5, anchorY: 0.5, hidden : true, touchable: false});
        scene.append(backbody);
        gameImages.push(backbody);

        //めがね
        let bodymegane = new g.FrameSprite({scene: scene, src: scene.assets["megane"],
            x: 638, y: 165,anchorX: 0.5, anchorY: 0.5, hidden : true, touchable: false});
        scene.append(bodymegane);

        //メガネオンオフボタン
        let meganetoggle = new g.FrameSprite({scene: scene, src: scene.assets["megane_button"],x: g.game.width - 100,opacity: 1, touchable: true});
        scene.append(meganetoggle);
        
        // ターゲット名称ラベルヘッダー
        let TargetHeder = new g.Label({scene: scene,text: "Target", font: font1,
            fontSize: font1.size / 2, textColor: "darkorange", y: 0.40 * g.game.height, hidden : true});
        scene.append(TargetHeder);
        gameSteates.push(TargetHeder);

        // ターゲット名称ラベル
        let TargetLabel = new g.Label({scene: scene,text: getbodyName(t_str[t_int],t_hp), font: font,
            fontSize: font.size , textColor: "black", y: 0.50 * g.game.height, hidden : true});
        scene.append(TargetLabel);
        gameSteates.push(TargetLabel);
    
        // 次ターゲット名称ラベルヘッダー
        let NextHerder = new g.Label({scene: scene,text: "Next", font: font1,
            fontSize: font1.size / 2, textColor: "darkorange", y: 0.60 * g.game.height, hidden : true});
        scene.append(NextHerder);
        gameSteates.push(NextHerder);

        // 次ターゲット名称ラベル
        let NextLabel = new g.Label({scene: scene,text: getbodyName(t_str[Nextparts],Nexthp), font: font,
            fontSize: font.size , textColor: "black", y: 0.70 * g.game.height, hidden : true});
        scene.append(NextLabel);
        gameSteates.push(NextLabel);

        //当たり判定(普段は見えない)
        let find = new g.FilledRect({scene: scene,x:t_list[t_int][0], y:t_list[t_int][1], width: t_list[t_int][2], height:t_list[t_int][3], 
            angle:t_list[t_int][4], cssColor: "black", hidden : true ,opacity:0});
        scene.append(find);
        gameSteates.push(find);

        let opentext = new g.FrameSprite({scene: scene, src: scene.assets["result_button"],
            x: g.game.width - 64, y: g.game.height - 64, hidden : true, touchable: false, opacity:1});
        gameOmake.push(opentext);
        scene.append(opentext);
        opentext.invalidate();

        let hidari_button = new g.FrameSprite({scene: scene, src: scene.assets["yazi_hidari"],
            x: 10, y: 10, hidden : true, touchable: true, opacity:1});
        gameOmake.push(hidari_button);
        scene.append(hidari_button);
        hidari_button.invalidate();
        hidari_button.onPointDown.add(function(){
            if (bodyNo == 1){
                bodyNo = bodytotal + 2;
            }
            else{
                bodyNo -= 1;
            }
            backbody.src = scene.assets["body" + bodyNo];
            backbody.invalidate();
        });

        let migi_button = new g.FrameSprite({scene: scene, src: scene.assets["yazi_migi"],
            x: 110, y: 10, hidden : true, touchable: true, opacity:1});
        gameOmake.push(migi_button);
        scene.append(migi_button);
        migi_button.invalidate();
        migi_button.onPointDown.add(function(){
            if (bodyNo == bodytotal + 2){
                bodyNo = 1;
            }
            else{
                bodyNo += 1;
            }
            backbody.src = scene.assets["body" + bodyNo];
            backbody.invalidate();
        });

        // ■■■■■■■■■■■■　 メイン描画　　■■■■■■■■■■■■
        //ゲームスタート
        startimage.onPointDown.add(function () {if (warmup < 10){
            scene.assets["se_start"].play().changeVolume(0.6);
            scene.assets["bgm"].play().changeVolume(0.3);

            gameImages.forEach(function(Obj){Obj.show();});
            gameSteates.forEach(function(Obj){Obj.show();});
            backbody.touchable = true;
            find.touchable = true;
            TargetLabel.text = getbodyName(t_str[t_int],t_hp);
            NextLabel.text = getbodyName(t_str[Nextparts],Nexthp);

            startimage.touchable = false;
            startimage.hide();

            gamestate = true;
        }});

        //メガネオンオフ
        meganetoggle.onPointDown.add(function(){
            if(bodymegane.visible() == true){
                bodymegane.hide();
            }
            else{
                bodymegane.show();
            }
        });

        //体を触ると減点
        backbody.onPointDown.add(function(){
            scene.assets["se_hazure"].play().changeVolume(0.6);
            myhp -= getrandom(1000,2000,-1);
            //HP切れ
            if (myhp < 0){
                bodyNo = bodytotal + 2;
                resultstate = true;
                myhp = 0;
                scene.assets["se_finish2"].play().changeVolume(0.6);
                //scene.assets["bo_finish2"].play().changeVolume(0.6);
            }
            myhpLabel.text = "HP:" + myhp;

            backbody.invalidate();
            myhpLabel.invalidate();
        });

        //ターゲットを触るとスコアアップ
        find.onPointDown.add(function(){
            hitpoint -= 1;
            t_hp -= 1;

            //次形態
            if (hitpoint % 10 == 0 && hitpoint != 0){
                bodyNo += 1;            
                t_list = createTargetList(bodyNo);
                t_str = crateTargetStr(bodyNo);
                backbody.src = scene.assets["body" + bodyNo];
                waitthen = true;
                backbody.touchable = false;

                partsId = getrandom(1, t_str.length - 1, -1);
                Nextparts = getrandom(1, t_str.length - 1, partsId);
                t_int = partsId;

                t_hp = getrandom(1, hp_max, -1);
                Nexthp = getrandom(1, hp_max, -1);
                scene.assets["se_seikai2"].play().changeVolume(0.6);
                //scene.assets["damage"].play().changeVolume(0.6);
                NextLabel.text = getbodyName(t_str[Nextparts],Nexthp);
                NextLabel.invalidate();
            }
            //有罪
            else if (hitpoint == 0){
                bodyNo = bodytotal;
                resultstate = true;
                scene.assets["se_finish1"].play().changeVolume(0.6);
                //scene.assets["bo_finish1"].play().changeVolume(0.6);
            }
            else{
                scene.assets["se_seikai"].play().changeVolume(0.6);
            }

            if (t_hp == 0){
                t_int = Nextparts;
                t_hp = Nexthp;
                Nextparts = getrandom(1, t_str.length - 1, t_int);
                Nexthp = getrandom(1, hp_max, -1);

                NextLabel.text = getbodyName(t_str[Nextparts],Nexthp);
                NextLabel.invalidate();
            }

            let kapu_hantei = getrandom(1, 25, -1);
            if (kapu_hantei == 1){
                if(kapuseruground.visible() == true){
                    kapuseruground.hide();
                    kapuseruground2.show();
                }
                else{
                    kapuseruground.show();
                    kapuseruground2.hide();
                }
            }

            find.x = t_list[t_int][0];
            find.y = t_list[t_int][1];
            find.width = t_list[t_int][2];
            find.height = t_list[t_int][3];
            find.angle = t_list[t_int][4];
            find.modified();

            TargetLabel.text = getbodyName(t_str[t_int],t_hp);
            TargetLabel.invalidate();
            backbody.invalidate();
            
        });

        scene.onUpdate.add(function () {//時間経過
            //タイムアウト
            if (gamestate == false){
                startWait += 1 / g.game.fps;
                if (startWait >= 15){
                    startimage.touchable = false;
                    startimage.hide();
                    meganetoggle.hide();
                    if(bodymegane.visible() == true){bodymegane.hide();}
                }
            }

            if (gamestate == true && resultstate == false && watchThen == false) { 
                gametime += 1 / g.game.fps; 

                if (debugmode == true){find.opacity = 0.5;}

                //形態変化時の無敵時間
                if (waitthen == true){
                    waittime  += 1 / g.game.fps;
                    backbody.touchable = false;
                    if (waittime >= 1){
                        backbody.touchable = true;
                        waittime = 0;
                        waitthen = false;
                    }
                    backbody.invalidate();
                }

                //時間切れ
                if (gametime >= 60){
                    gametime = 60;
                    bodyNo = bodytotal + 2;
                    resultstate = true;
                    scene.assets["se_finish2"].play().changeVolume(0.3);
                    //scene.assets["bo_finish2"].play().changeVolume(0.6);
                }
                else{
                    timeLabel.text = "TIME: " + String((Math.floor((60 - gametime) * 10) / 10));
                    timeLabel.invalidate();
                };
            }
            else if (gamestate == true && resultstate == true){
                resultstate = false;

                gameSteates.forEach(function(Obj){Obj.touchable = false; Obj.hide();});
                gameImages.forEach(function(Obj){Obj.touchable = false;});

                backbody.src = scene.assets["body" + bodyNo];
                backbody.invalidate();

                // リザルト
                let sinImage = new g.FrameSprite({scene: scene, src: scene.assets["yuzai"],  opacity: 1,
                    x: g.game.width/4, y: g.game.height/2,anchorX: 0.65, anchorY: 0.35, hidden : true, touchable: false});
                scene.append(sinImage);
                gameResults.push(sinImage);

                let resultLabel = new g.FilledRect({scene: scene,x: g.game.width/2, y: g.game.height/2,anchorX: 0.65, anchorY: 0.4,
                    opacity: 0.5, width: g.game.width/2, height: g.game.height/1.5, cssColor: "black",hidden : true});
                scene.append(resultLabel);
                gameResults.push(resultLabel);
            
                let destLabel = new g.Label({scene: scene,text: "装甲破壊率         " + 100.0, font: font,
                    textColor: "lavender",fontSize: font.size , x: g.game.width/3.5, y: g.game.height/3, hidden : true});
                scene.append(destLabel);
                gameResults.push(destLabel);
            
                let t_bonusLabel = new g.Label({scene: scene,text: "タイムボーナス   " + 10, font: font,
                    textColor: "lavender", fontSize: font.size , x: g.game.width/3.5, y: g.game.height/3, anchorY: -1.5, hidden : true});
                scene.append(t_bonusLabel);
                gameResults.push(t_bonusLabel);
            
                let l_bonusLabel = new g.Label({scene: scene,text: "ライフボーナス   " + 10, font: font,
                textColor: "lavender",fontSize: font.size , x: g.game.width/3.5, y: g.game.height/3, anchorY: -3, hidden : true});
                scene.append(l_bonusLabel);
                gameResults.push(l_bonusLabel);
            
                let scoreLabel = new g.Label({scene: scene,text: "SCORE:   " + 10, font: font,
                textColor: "lavender",fontSize: font.size, x: g.game.width/3.5, y: g.game.height/3, anchorY: -5.5, hidden : true});
                scene.append(scoreLabel);
                gameResults.push(scoreLabel);

                let cleseText = new g.Label({scene: scene,text: "✖", font: font,touchable: false,opacity:1,
                    textColor: "lavender",fontSize: font.size , x: g.game.width/1.6, y: g.game.height/2, anchorX: -0.3, anchorY: 4, hidden : true});
                    scene.append(cleseText);
                gameResults.push(cleseText);

                let closeLabel = new g.FilledRect({scene: scene,touchable: true,width: 70, height: 70, opacity: 0,
                    cssColor: "red", x: g.game.width/1.8, y: g.game.height/1.7, anchorX: -1.2, anchorY: 4, hidden : true});
                scene.append(closeLabel);
                gameResults.push(closeLabel);

                //リザルト画面を閉じる
                closeLabel.onPointDown.add(function(){
                    if (yuzaiThen == true){
                        bodyNo = bodytotal + 1;
                        backbody.src = scene.assets["body" + bodyNo];
                        backbody.invalidate();
                    }
                    closeLabel.touchable = false;
                    opentext.touchable = true;
                    gameOmake.forEach(function(Obj){Obj.modified(); Obj.show();});
                    gameResults.forEach(function(Obj){Obj.modified(); Obj.hide();});
                });

                //リザルト画面を開く
                opentext.onPointDown.add(function(){
                    if (yuzaiThen == true){
                        bodyNo = bodytotal;
                    }
                    else{
                        bodyNo = bodytotal + 2;
                    }
                    backbody.src = scene.assets["body" + bodyNo];
                    backbody.invalidate();

                    closeLabel.touchable = true;
                    opentext.touchable = false;
                    gameResults.forEach(function(Obj){Obj.modified(); Obj.show();});
                    gameOmake.forEach(function(Obj){Obj.modified(); Obj.hide();});
                });
            
            
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
                    yuzaiThen = true;
                }
                else{
                    sinImage.src = scene.assets["muzai"];
                    yuzaiThen = false;
                }
                let scorevar = Math.floor((destint + t_bonus + l_bonus) * 10);
                for (let i = 1; i <= 5; i++){
                    g.game.vars.gameState.score = scorevar;
                }
                scoreLabel.text = "SCORE: " + String(g.game.vars.gameState.score);
            
                sinImage.invalidate();
                destLabel.invalidate();
                scoreLabel.invalidate();
                t_bonusLabel.invalidate();
                l_bonusLabel.invalidate();
                gameResults.forEach(function(Obj){Obj.modified(); Obj.show();});
            
                watchThen = true;
            }
            else if (gamestate == true && watchThen == true){

            }
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

function crateTargetStr(bodyNo){
    let t_str = [""]

    switch (bodyNo){
        case 1:
            t_str.push("パーカー(左)");
            t_str.push("パーカー(右)");
            t_str.push("シャツ(むね)");
            t_str.push("短パン");
            t_str.push("タイツ(左)");
            t_str.push("タイツ(右)");
            break;

        case 2:
            t_str.push("シャツそで(左)");
            t_str.push("シャツそで(右)");
            t_str.push("シャツ(むね)");
            t_str.push("短パン");
            t_str.push("タイツ(左)");
            t_str.push("タイツ(右)");
            break;

        case 3:
            t_str.push("シャツそで(左)");
            t_str.push("シャツそで(右)");
            t_str.push("シャツ(むね)");
            t_str.push("短パン");
            t_str.push("タイツ(左)");
            t_str.push("タイツ(右)");
            break;

        case 4:
            t_str.push("シャツそで(左)");
            t_str.push("シャツそで(右)");
            t_str.push("シャツ(むね)");
            t_str.push("短パン");
            t_str.push("タイツ(左)");
            t_str.push("タイツ(右)");
            break;

        case 5:
            t_str.push("シャツ(左むね)");
            t_str.push("シャツ(右むね)");
            t_str.push("シャツそで(左)");
            t_str.push("ブラ");
            t_str.push("パンツ");
            t_str.push("タイツ(左)");
            t_str.push("タイツ(右)");
            break;

        case 6:
            t_str.push("さきっちょ(左)");
            t_str.push("さきっちょ(右)");
            t_str.push("ぱんつ");
            break;
    }

    return t_str;
}

function createTargetList(bodyNo){
    let t_list = [""];

    switch (bodyNo){
        case 1:
            //x,y,width,height,angle
            t_list.push([445,230,185,425,8]); //パーカー(左)
            t_list.push([665,247,160,420,-5]); //パーカー(右)
            t_list.push([595,236,85,158,0]); //シャツ(むね)
            t_list.push([580,392,110,163,0]); //短パン
            t_list.push([550,554,93,164,0]); //ひだりタイツ
            t_list.push([650,554,70,164,-5]); //みぎタイツ
            break;

        case 2:
            t_list.push([450,270,110,160,-20]); //シャツそで(左)
            t_list.push([730,247,100,160,20]); //シャツそで(右)
            t_list.push([570,240,150,158,0]); //シャツ(むね)
            t_list.push([545,392,199,163,0]); //短パン
            t_list.push([550,554,93,164,0]); //ひだりタイツ
            t_list.push([640,554,93,164,0]); //みぎタイツ
            break;

        case 3:
            t_list.push([470,270,90,160,-20]); //シャツそで(左)
            t_list.push([730,247,100,160,20]); //シャツそで(右)
            t_list.push([570,240,150,158,0]); //シャツ(むね)
            t_list.push([550,392,195,163,0]); //短パン
            t_list.push([550,554,93,164,0]); //ひだりタイツ
            t_list.push([640,554,93,164,0]); //みぎタイツ
            break;

        case 4:
            t_list.push([470,270,90,160,-20]); //シャツそで(左)
            t_list.push([720,270,80,130,20]); //シャツそで(右)
            t_list.push([570,240,150,158,0]); //シャツ(むね)
            t_list.push([575,392,160,163,0]); //短パン
            t_list.push([550,554,93,164,0]); //ひだりタイツ
            t_list.push([640,554,93,164,0]); //みぎタイツ
            break;

        case 5:
            t_list.push([565,260,60,120,0]); //シャツ(左むね)
            t_list.push([645,235,65,150,0]); //シャツ(右むね)
            t_list.push([520,330,65,75,0]); //シャツそで(左)
            t_list.push([620,285,40,65,0]); //ブラ
            t_list.push([560,440,155,65,0]); //ぱんつ
            t_list.push([555,555,80,165,0]); //ひだりタイツ
            t_list.push([645,555,90,160,0]); //みぎタイツ
            break;

        case 6:
            t_list.push([570,280,55,65,0]); //さきっちょ(左)
            t_list.push([660,280,50,65,0]); //さきっちょ(右)
            t_list.push([560,445,150,65,0]); //ぱんつ
            break;
    }

    return t_list;
}
