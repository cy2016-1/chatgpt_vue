<template>
    <div class="container">

        <div class="aside" :class="{ 'aside-mobile': isMobile, 'aside-desktop': !isMobile }" v-if="isShowSideBar">
            <div style="height: 8%;">
                <el-button
                    style="border: 1px solid rgba(255, 255, 255, 0.5);width: 80%;border-radius: 5px;background-color: transparent;color: white;margin-top: 10px;padding: 10px;"
                    @click="createNewSession">+
                    新建会话</el-button>
            </div>
            <div style="max-height: 72%;overflow-y: auto;overflow: hidden; flex: 1;">
                <div class="sessionList" v-for="(session, index) in sessions.slice().reverse()" :key="index"
                    @click="isLoading || isNewMsg ? null : changeSession(session)">
                    <div style="margin-left: 10%; display: flex; align-items: center;width: 80%;border-radius: 5px;"
                        :class="{ 'session-active': session === currentSession }">
                        <i class="el-icon-chat-dot-square" style="color: white;margin-left: 5px;width: 10%; "></i>
                        <div style="flex: 1;text-align: left;margin-left: 5px;" v-text="session.name">
                        </div>
                        <el-button
                            style=" margin: 8px; padding: 0;border: none;background-color: transparent;color: white;width: 10px;"
                            icon="el-icon-edit" @click="editSession(session)"></el-button>
                        <el-button style=" margin: 8px;padding: 0;border: none;background-color: transparent;color: white;"
                            icon="el-icon-delete" @click="deleteSession(session)"></el-button>
                    </div>
                </div>
            </div>
            <div
                style="height: 20%;border-top: 1px solid rgba(250, 250, 250, 0.5);display: flex;flex-direction: column;align-items: flex-start;">
                <div class="setting_btn">
                    <el-button icon="el-icon-setting" @click="settingsVisible = true"></el-button>

                </div>
                <div class="switch_btn">
                    <el-switch size="mini" v-model="isContextChat" inactive-color="rgba(255, 255, 255, 0.3)"
                        active-color="#13ce66" active-text="连续对话">
                    </el-switch>
                </div>
                <div class="select_btn">
                    <el-select size="small" v-model="currentSession.language" placeholder="语音">
                        <el-option v-for="item in langsOptions" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                    </el-select>
                </div>
            </div>
        </div>
        <div class="rightSide">
            <div class="header" style="display: flex; align-items: center;justify-content: center">
                <div v-if="isMobile" style="margin-left: 5px;justify-content: flex-start;">
                    <el-button style="border: none;font-size: 20px;align-items: center" icon="el-icon-s-unfold"
                        @click="toggleSideBar"></el-button>
                </div>
                <div style="margin: 0 auto;justify-content: center;align-items: center;">
                    <img src="/images/logo.png" alt=""
                        style="width: 80px; height: 80px; border-radius: 50%;margin-top: 10px; ">
                </div>

            </div>
            <div class="main">
                <div id="imageDom" class="chat-box" style="margin-top: 20px; max-height: 85%;overflow-y: auto;">
                    <div v-for="(item, index) in currentSession.messageHistory" :key="index"
                        style="display: flex; align-items: flex-start;text-align: left;">
                        <img :src="item.sender === 'assistant' ? '/images/ai.png' : '/images/user.png'" alt=""
                            style="width: 30px; height: 30px; margin-right: 10px;">
                        <div v-text="item.message" style="white-space: pre-line;">
                        </div>
                    </div>
                    <div v-if="isNewMsg" style="display: flex;align-items: flex-start;text-align: left;">
                        <img :src="'/images/ai.png'" alt="" style="width: 30px; height: 30px; margin-right: 10px;">
                        <div ref="content" v-if="isNewMsg" style="white-space: pre-line;" v-html="renderedContent"></div>
                    </div>
                </div>
                <div>
                    <el-dialog icon="el-icon-setting" title="设置" :visible.sync="settingsVisible">
                        <div style="display: flex;flex-direction: column;align-items: flex-start;">
                            <div style="display: flex;">
                                <div v-show="!balanceVisible">
                                    <el-button size="small" icon="el-icon-search" circle @click="getBalance"></el-button>
                                    <span style="margin-left: 10px;">查询余额</span>
                                </div>
                                <div v-show="balanceVisible" style="margin-left: 10px;">
                                    <span>总金额 $:{{ total }}</span>
                                    <span style="margin-left: 10px;">已使用 $:{{ usage }}</span>
                                    <span style="margin-left: 10px;">余额 $:{{ balance }}</span>
                                </div>
                            </div>

                            <el-select size="small" style="width: 70%;margin-top: 10px;" v-model="maxTokens"
                                placeholder="选择max_tokens">
                                <el-option v-for="item in tokenOptions" :key="item.value" :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
                            <el-input v-model="apiKey" type="textarea" placeholder="输入Apikey"
                                style="margin-top: 10px;width: 70%;height: 20px;">
                                <template slot="prepend">ApiKey:</template>
                            </el-input>
                        </div>
                    </el-dialog>
                </div>
            </div>

            <div class="footer">
                <div v-loading="isLoading" element-loading-spinner="el-icon-loading"></div>
                <div class="input-box">
                    <el-input v-model="inputValue" size="small" type="textarea" placeholder="请输入你的问题"
                        @keyup.enter.native="sendMessage" />
                    <el-button size="small" icon="el-icon-search" circle @click="sendMessage" style="margin-left: 5px;"
                        :disabled="isLoading"></el-button>
                </div>
                <div class="audio-box">
                    <el-button :class="[isRecording ? 'green-bg' : 'white-bg']" size="small" icon="el-icon-microphone"
                        circle @click="startRecordAudio" :disabled="isRecording">
                    </el-button>
                    <el-button icon="el-icon-turn-off-microphone" size="small" circle @click="stopRecordAudio"
                        :disabled="!isRecording"></el-button>
                    <el-button style="padding: 0; border: none;font-size: 35px;" @click="toggleAudio" :disabled="!audio">
                        <i v-if="isPlaying" class="el-icon-video-pause"></i>
                        <i v-else class="el-icon-video-play"></i>
                    </el-button>
                    <el-button icon="el-icon-refresh" circle size="small" @click="deleteChatHistory">
                    </el-button>
                    <el-button icon="el-icon-download" circle size="small" @click="generateImage"></el-button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
import Recorder from 'js-audio-recorder';
import html2canvas from 'html2canvas';
export default {
    name: 'ChatBox',
    data() {
        return {
            sessions: [
                {
                    sid: null,
                    language: '',
                    name: '会话1',
                    messageHistory: [{ sender: "assistant", message: "Hi Stark,I am Jarvis ", time: new Date() }]
                }
            ],
            number: null,
            sid: null,
            currentSession: null,
            socket: null,
            inputValue: '',
            isContextChat: true,
            isLoading: false,
            isRecording: false,
            isPlaying: false,
            settingsVisible: false,
            balanceVisible: false,
            isMobile: false,
            isNewMsg: false,
            aiMessage: '',
            audio: null,
            audioUrl: '',
            tts: '',
            recorder: null,
            apiKey: '',
            maxTokens: '',
            total: '',
            usage: '',
            balance: '',
            isShowSideBar: false,
            tokenOptions: [
                {
                    value: 512,
                    label: '512'
                },
                {
                    value: 1024,
                    label: '1024'
                },
                {
                    value: 2048,
                    label: '2048'
                },
                {
                    value: 3072,
                    label: '3072'
                }

            ],
            langsOptions: [
                {
                    value: 'zh-CN-XiaohanNeural',
                    label: '普通话女成熟'
                },
                {
                    value: 'zh-CN-XiaomengNeural',
                    label: '普通话女青春'
                },
                {
                    value: 'zh-CN-XiaomoNeural',
                    label: '普通话御姐'
                },
                {
                    value: 'zh-CN-YunyangNeural',
                    label: '普通话男'
                }, {
                    value: 'zh-HK-HiuGaaiNeural',
                    label: '粤语女'
                }, {
                    value: 'zh-HK-WanLungNeural',
                    label: '粤语男'
                }, {
                    value: 'ja-JP-MayuNeural',
                    label: '日语女'
                },
                {
                    value: 'ja-JP-DaichiNeural',
                    label: '日语男'
                }, {
                    value: 'en-GB-AbbiNeural',
                    label: '英语(英)女'
                }, {
                    value: 'en-GB-AlfieNeural',
                    label: '英语(英)男'
                },
                {
                    value: 'en-US-AshleyNeural',
                    label: '英语(美)女'
                }, {
                    value: 'en-US-BrandonNeural',
                    label: '英语(美)男'
                }
            ]
        };
    },
    created() {
        this.recorder = new Recorder({
            // 以下是默认配置
            sampleBits: 16, //深度
            sampleRate: 16000, // 采样率,
            numChannels: 1,
        }),
        this.sid = this.getUuid();
        this.currentSession = this.sessions[0];
        this.webSocketInit();
        this.isNewMsg = false;

    },
    mounted() {
        window.addEventListener('resize', this.handleWindowSizeChange);
        this.handleWindowSizeChange();

    },
    watch: {
        //当aiMessage不再变化时把机器人回复保存到data中
        //ToDoList： 存在bug 如果网络延迟，websocket响应超过1500ms 会不断保存
        aiMessage() {
            clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.saveAiMessage();
            }, 1500);
        }
    },

    computed: {
        // 将content属性渲染为HTML代码，并实现打字效果
        renderedContent() {
            let html = '';
            html += `${this.aiMessage}`;
            return html;
        },
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.handleWindowSizeChange);
    },
    methods: {
        saveAiMessage() {
            if (this.aiMessage && this.isNewMsg) {
                const msg = this.aiMessage;
                this.aiMessage = '';
                const aiMessage = {
                    message: msg,
                    sender: "assistant",
                    time: new Date()
                };
                this.isNewMsg = false;
                this.tts = msg;
                if (this.currentSession.language) {
                    console.log("tts", this.tts);
                    this.generateAudio();
                    this.playAudio();
                }
                this.currentSession.messageHistory.push(aiMessage);
            }

        },
        //聊天记录导出
        generateImage() {
            this.$confirm('确定导出当前聊天记录为图片吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.exportAsImage();
            });
        },

        async exportAsImage() {
            const imageElement = document.getElementById('imageDom');
            const currentSessionName = this.currentSession.name;
            const currentDate = new Date();
            const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')} ${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}:${currentDate.getSeconds().toString().padStart(2, '0')}`;
            const filename = `${currentSessionName} ${formattedDate}.png`;
            // 将滚动条滚动到顶部
            setTimeout(() => {
                imageElement.scrollTo(0, 0);
            }, 200);

            setTimeout(async () => {
                try {
                    const canvas = await html2canvas(imageElement, {
                        backgroundColor: 'white',
                        useCORS: true,
                        scale: 1,
                        height: document.getElementById('imageDom').scrollHeight + 1000,
                        windowHeight: document.getElementById('imageDom').scrollHeight + 2000,
                        logging: true
                    });
                    const imgUrl = canvas.toDataURL('image/png');
                    const tempLink = document.createElement('a');
                    tempLink.style.display = 'none';
                    tempLink.href = imgUrl;
                    tempLink.setAttribute('download', filename);
                    if (typeof tempLink.download === 'undefined') {
                        tempLink.setAttribute('target', '_blank');
                    }
                    document.body.appendChild(tempLink);
                    tempLink.click();
                    document.body.removeChild(tempLink);
                    window.URL.revokeObjectURL(imgUrl);

                } catch (error) {
                    console.error(error);
                }
            }, 2000);
        },

     
        //判断设备是否为手机，如果是手机则折叠侧栏否则显示侧边栏
        handleWindowSizeChange() {
            if (window.innerWidth <= 768) {
                this.isShowSideBar = false;
                this.isMobile = true;
            } else {
                this.isShowSideBar = true;
                this.isMobile = false;
            }
        },

        //创建会话
        createNewSession() {
            const sid = this.getUuid;
            const newSession = {
                language: '',
                sid: sid,
                name: `会话${this.sessions.length + 1}`,
                messageHistory: [{ sender: "assistant", message: "Hi Stark,I am Jarvis ", time: new Date() }]
            };
            this.sessions.push(newSession);
            this.currentSession = newSession;
        },

        //切换会话
        changeSession(session) {
            this.currentSession = session;
        },

        //编辑会话标题
        editSession(session) {
            const newName = prompt('修改会话标题', session.name);
            if (newName) {
                session.name = newName;
            }
        },

        //删除会话
        deleteSession(session) {
            this.$confirm('确定要删除该会话吗？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                const index = this.sessions.indexOf(session);
                this.sessions.splice(index, 1);
                if (this.sessions.length === 0) {
                    // 如果会话列表为空，则创建一个新的会话
                    this.createNewSession();
                } else if (this.currentSession === session) {
                    // 如果删除的是当前会话，则将当前会话设置为最后一个会话
                    this.currentSession = this.sessions[this.sessions.length - 1];
                }
            }).catch(() => {
                // do nothing if cancel
            });
        },

        //查询余额
        getBalance() {
            const url = `http://192.168.100.204:8080/getBalance`;
            axios.post(url, {
                apiKey: this.apiKey
            }).then(response => {
                this.total = response.data.total;
                this.usage = response.data.usage;
                this.balance = response.data.balance;
                this.balanceVisible = true;
            }).catch(error => {
                console.log(error);
                this.settingsVisible = false;
                this.$message.error('余额查询出错');
            })
        },

        // 发送消息
        sendMessage() {
            if (!this.currentSession) {
                return;
            }
            if (this.inputValue) {
                // 添加用户发送的消息到聊天记录
                const userMessage = { message: this.inputValue, sender: "user", time: new Date() };
                this.currentSession.messageHistory.push(userMessage);
                this.aiMessage = '';
                // 发送请求获取机器人回复
                this.getRobotReply();
                this.inputValue = '';
            }
        },

        //获取ai回复
        getRobotReply() {
            try {
                // this.isLoading = true; // 显示加载提示
                console.log("isContextChat:" + this.isContextChat)
                const data = {
                    messageHistory: this.currentSession.messageHistory,
                    isContextChat: this.isContextChat,
                    apiKey: this.apiKey,
                    maxTokens: this.maxTokens
                };
                this.number = this.getUuid;
                this.socket.send(JSON.stringify(data));
                this.isNewMsg = true;
            } catch (error) {
                this.$message.error('请求ChatGpt服务器超时');
                console.log(error);
                this.isLoading = false; // 隐藏加载提示
            }
        },

        //websocket初始化
        webSocketInit() {
            const sid = this.sid;
            const heartbeatMsg = "this is the heartbeat message";
            // WS连接地址，需和服务器端的ServerEndpoint保持一致
            const wsServer = (window.location.protocol + '//' + `192.168.100.204:8080` + "/streamChat/" + sid)
                .replace("http", "ws")
                .replace("https", "wss");
            console.log(wsServer);
            // 重连次数
            let reconnectCount = 0;
            // 实例化WebSocket
            this.socket = new WebSocket(wsServer);
            //打开事件
            this.socket.onopen = () => {
                reconnectCount = 1;
                console.log("WebSockets连接已建立，正在等待数据");
            }

            //关闭事件
            this.socket.onclose = () => {
                if (reconnectCount <= 15) {
                    console.log("WebSockets连接关闭了，正在尝试第" + reconnectCount++ + "次重新连接");
                    this.reconnect();
                    this.isNewMsg = false;
                    //如果后端服务器请求gpt失败会导致websocket断开，再次连接
                    this.$message.warning('与服务器的连接已断开请刷新页面或者确保代理开启');
                } else {
                    console.log("WebSockets连接关闭了，如需继续使用，请刷新页面");
                    // 触发提示框
                    this.$message.warning('与服务器的连接已断开请刷新页面');
                }
            }

            //获得消息事件
            this.socket.onmessage = (msg) => {
                // 过滤心跳信息
                if (msg.data !== heartbeatMsg) {
                    this.aiMessage += msg.data;
                }
            }
        },

        // 重连
        reconnect() {
            setTimeout(() => {
                this.webSocketInit();
            }, 2000);
        },

        getUuid() {
            return 'xxxxxxxxxxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (Math.random() * 16) | 0,
                    v = c === 'x' ? r : (r & 0x3) | 0x8;
                console.log(v.toString(16));
                return v.toString(16);
            });
        },

        //清空缓存
        deleteChatHistory() {
            this.$confirm('确定要清空当前内容吗', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //清空聊天记录
                this.currentSession.messageHistory = [];
                this.isNewMsg = false;
                //清空语音
                this.audio = null;
                //取消语音选择
                this.currentSession.language = '';
                //清空输入框
                this.inputValue = '';
                const userMessage = { sender: "assistant", message: "Hi Stark,I am Jarvis ", time: new Date() };
                this.currentSession.messageHistory.push(userMessage);
            }).catch(() => {
                // do nothing if cancel
            });

        },

        //开始录音
        startRecordAudio() {
            if (this.currentSession.language) {
                Recorder.getPermission().then(
                    () => {
                        this.audio = null;
                        console.log("开始录音");
                        this.inputValue = '录音中...';
                        this.isRecording = true;
                        this.recorder.start(); // 开始录音
                    },
                    (error) => {
                        this.$message({
                            message: "请先允许该网页使用麦克风",
                            type: "info",
                        });
                        console.log(`${error.name} : ${error.message}`);
                    }
                );
            } else {
                //如果没有选择语言 则提示选择
                this.$message({
                    message: "请先选择语言",
                    type: "info",
                });
            }
        },
        
        //停止录音 并上传录音
        stopRecordAudio() {
            console.log("停止录音");
            this.recorder.stop();
            this.inputValue = '';
            this.isRecording = false;
            const wavBlob = this.recorder.getWAVBlob();
            console.log("wavBlob:" + wavBlob);
            this.uploadWAVData();
        },

        //上传wav录音数据
        uploadWAVData() {
            this.isLoading = true;
            const wavBlob = this.recorder.getWAVBlob();
            console.log("wavBlob:" + wavBlob);
            // 创建一个formData对象
            const formData = new FormData();
            // 此处获取到blob对象后需要设置fileName满足当前项目上传需求
            const newbolb = new Blob([wavBlob], { type: 'audio/wav' });
            //获取当时时间戳作为文件名
            const fileOfBlob = new File([newbolb], new Date().getTime() + '.wav');
            const audioUrl = URL.createObjectURL(fileOfBlob); // 创建URL
            //保存录音
            this.audio = new Audio(audioUrl);
            formData.append('audio', fileOfBlob);
            formData.append('lang', this.currentSession.language);
            axios.post('http://192.168.100.204:8080/voice', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
                .then(response => {
                    console.log(response.data);
                    this.inputValue = response.data.text;
                    this.isLoading = false;
                    this.sendMessage();
                })
                .catch(error => {
                    this.$message.error('语音发送出错');
                    console.log(error);
                    this.isLoading = false;
                })
        },

        //取消录音
        cancelRecordAudio() {
            this.recorder.stop();
            this.inputValue = '';
            this.isRecording = false;
        },

        //播放录音
        playRecordAudio() {
            console.log("播放录音");
            this.recorder.play();
        },

        //机器人回复生成语音
        async generateAudio() {
            try {
                this.isLoading = true;
                //先清空缓存中的录音文件
                this.audio = null;
                // 向后端发送请求，生成音频文件
                const response = await axios.post('http://192.168.100.204:8080/tts', {
                    text: this.tts,
                    language: this.currentSession.language
                }, {
                    responseType: 'arraybuffer'
                });
                console.log("response:" + response);
                const audioBlob = new Blob([response.data], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob); // 创建URL
                this.audio = new Audio(audioUrl); // 创建Audio对象
                console.log("audioUrl:" + audioUrl);
                this.isLoading = false;
                this.playAudio(); // 播放音频
                //清空tts
                this.tts = '';
            }
            catch (error) {
                this.$message.error('语音生成出错');
                this.isLoading = false;
            }
        },
        
        //控制语音播放
        toggleAudio() {
            if (this.audio) {
                if (this.audio.paused) {
                    this.audio.play();
                } else {
                    this.audio.pause();
                }
                this.isPlaying = !this.isPlaying;
            }
        },
        playAudio() {
            if (this.audio) {
                this.audio.play();
            }
        },
        toggleSideBar() {
            this.isShowSideBar = !this.isShowSideBar;
        }
    }
};
</script>
  
<style>
.chat-box {
    display: flex;
    flex-direction: column;
    /* 左对齐 */
    align-items: flex-start;
    max-width: 80%;
    margin: 0 auto;
    padding: 20px;
    background-color: #f7f7f7;
    border-radius: 10px;
    margin-bottom: auto;
}

.chat-box>div {
    display: flex;
    flex-direction: center;
    justify-content: flex-start;
    /* 左对齐 */
    align-items: flex-start;
    margin-bottom: 30px;
}

.input-box {
    width: 80%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.audio-box {
    width: 80%;
    margin-bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading {
    margin-bottom: 5px;
}

.green-bg {
    margin-left: 5px;
    background-color: #13ce66;
}


.white-bg {
    margin-left: 5px;
    background-color: white;

}

.container {
    display: flex;
    height: 100vh;
}

.header {
    height: 12vh;
}

.sessionList {
    margin-top: 10px;
}

.rightSide {
    flex: 1;
    display: flex;
    flex-direction: column;
    /* width: 85%; */
    height: 100vh;
}

.aside {

    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: black;
    color: white;
    font-size: 15px;
    font-weight: bold;
}

.aside-desktop {
    width: 18%;
}

.aside-mobile {
    width: 50%;
}

.main {
    justify-content: center;
    align-items: center;
    height: 76vh;

}

.footer {
    height: 12vh;

    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
}

.session-active {
    background-color: rgba(255, 255, 255, 0.3);
}

.select_btn {
    margin-left: 10%;
    margin-top: 10px;
    width: 60%;
}

.select_btn .el-input__inner {

    border-color: rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.3);
}

.select_btn .el-select-dropdown {
    border: none;
    background-color: rgba(0, 0, 0);
}

.switch_btn {

    margin-left: 10%;
    margin-top: 10px;

}

.setting_btn {

    margin-top: 10px;
}

.setting_btn .el-button {
    font-size: 18px;
    margin-left: 15%;

    /* padding-bottom: 0; */
    border: none;
    color: #f7f7f7;
    background-color: rgba(0, 0, 0);
}

.audio-box .el-button {
    margin: 8px;

}
</style>
