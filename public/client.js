const socket = io('localhost:3000')

socket.on('receive',data=>{
    if(data.id===myId)
        append(`${data.message}`,'left')
    else if(myId===(data.id.substr(24)+data.id.substr(0,24)))
        append(`You : ${data.message}`,'right')
})


const btn = document.querySelector('.btn')

const messageInput = document.getElementById('messageInp')

const messageContainer = document.querySelector('.container')

const append = (message,position)=>{
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageElement.classList.add('message')
    messageElement.classList.add(position)
    messageContainer.append(messageElement);
    messageInput.value = ''
}


/*video chat attempt (may be unsuccessful)*/
const myPeer = new Peer(undefined,{
    host:'videodesk-ennesimo.herokuapp.com',
    port:443,
    secure:true
});
const videoGrid = document.getElementById('video-grid');
var peerId="";
myPeer.on('open',peer_id=>{
    alert('connected'+peer_id);
    peerId = peer_id
})

const myVideo = document.createElement('video');
myVideo.muted = true;


function startConvo(userId){
navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
}).then(stream=>{
    addVideoStream(myVideo,stream);

    //whenever someone calls us, answer their call and send them our video stream
    myPeer.on('call',call=>{
        call.answer(stream);


        //listen to what is being sent to us
        const video = document.createElement('video');
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream);
        })
    })

    connectToNewUser(userId,stream);

})
}
socket.on('call',(data)=>{
    if(myId===data.id){
        if(confirm(`${data.id} wants to call`)){
            const button = "answer"
            axios.post(`/videoChat/${myId}`, {button,myId,peerId},{headers:{'Content-Type':'application/json'}}
                ).then((response) => {
                   
                },(error)=>{
                    console.log(error);
                });
        }
    }
})
socket.on('connected',data=>{
    if(data.myId===(myId.substr(24)+myId.substr(0,24))){
        startConvo(data.peerId);
    }
})
socket.on('callProgress',data=>{
    if(data.myId===(myId.substr(24)+myId.substr(0,24))){
            startConvo(data.peerId);
            const button = "sendPeerId"
            axios.post(`/videoChat/${myId}`, {button,myId,peerId},{headers:{'Content-Type':'application/json'}}
                ).then((response) => {
                   
                },(error)=>{
                    console.log(error);
                });
            startConvo(data.peerId);
    }
})


//fucntion to add a video stream to a div
function addVideoStream(video,stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata',()=>{
        video.play();
    })
    videoGrid.append(video);
}

//function to connect to new user
function connectToNewUser(userId,stream){
    //sending our video to other
    const call = myPeer.call(userId,stream);

    //listen to what is being sent to us by the others
    const video = document.createElement('video');
    call.on('stream',userVideoStream=>{
        addVideoStream(video,userVideoStream);
    })
    //listen to close event and close the video
    call.on('close',()=>{
        video.remove();
    })
}
