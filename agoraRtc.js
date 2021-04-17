let handlefail = function(err){
    console.log(err)
}

let appId = "47a2e970b3c24c91baed95a65d94cbe8";
let globalStream;
let isAudioMuted= false;
let isVidioMuted= false;

let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
})

client.init(appId,() => console.log("AgoraRTC Client Connected"),handlefail)

function removeMyVideoStream(){
    globalStream.stop()
}

function removeVideoStream(evt){
    let stream = evt.stream;
    stream.stop();
    let remDiv = document.getElementById(stream.getId())
    remDiv.parentNode.removeChild(remDiv);
}

function addVideoStream(streamId){
    console.log()
    let remoteContainer = document.getElementById("remoteStream");
    let streamDiv = document.createElement("div");
    streamDiv.id = streamId;
    // streamDiv.style.transform = "rotateY(180deg)";
    streamDiv.style.height = "250px"
    remoteContainer.appendChild(streamDiv)
}

document.getElementById("leave").onclick = function () {
    client.leave(function() {
        console.log("Left!")
    },handlefail)
    removeMyVideoStream();
}

document.getElementById("join").onclick = function () {
    let channelName = document.getElementById("channelName").value;
    let Username = document.getElementById("username").value;

    client.join(
        null,
        channelName,
        Username,
        () =>{
            var localStream = AgoraRTC.createStream({
                video: true,
                audio: true,
            })

            localStream.init(function(){
                localStream.play("selfStream")
                console.log(`App id: ${appId}\nChannel id: ${channelName}`)
                client.publish(localStream)
            })

            screenStream.init(function(){
                screenStream.play("screenStream")
                client.publish(screenStream)
            })

            globalStream = localStream
        }
    )

    client.on("stream-added", function (evt){
        console.log("Added Stream");
        client.subscribe(evt.stream,handlefail)
    })

    client.on("stream-subscribed", function(evt){
        console.log("Subscribed Stream");
        let stream = evt.stream;
        addVideoStream(stream.getId());  
        stream.play(stream.getId());
    })


    client.on("peer-leave", function (evt) {
        console.log("Peer has left")
        removeVideoStream(evt)}
        )
}

document.getElementById("video-mute").onclick = function(){
    if(!isVidioMuted){
        globalStream.muteVideo();
        isVidioMuted = true;
    }else{
        globalStream.unmuteVideo();
        isVidioMuted = false;
    }
}

document.getElementById("audio-mute").onclick = function(){
    if(!isAudioMuted){
        globalStream.muteAudio();
        isAudioMuted = true;
    }else{
        globalStream.unmuteAudio();
        isAudioMuted = false;
    }
}
