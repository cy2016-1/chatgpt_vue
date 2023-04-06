<template>
    <el-container>
        <el-header>
            <img src="/images/logo.png" alt=""
                style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 10px;">

        </el-header>
        <el-main>
            <div class="chat-box">
                <div v-for="(item, index) in messageHistory" :key="index" 
                    style="display: flex; align-items: flex-start;text-align: left;">
                    <img :src="item.sender === 'assistant' ? '/images/ai.png' : '/images/user.png'" alt=""
                        style="width: 30px; height: 30px; margin-right: 10px;">
                    <div v-text=item.message style="white-space: pre-line;"></div>
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
                            <el-select size="small" style="width: 70%;margin-top: 10px;" v-model="language"
                                placeholder="选择语言">
                                <el-option v-for="item in langsOptions" :key="item.value" :label="item.label"
                                    :value="item.value">
                                </el-option>
                            </el-select>
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
                            <el-switch size="mini" style="display: block;margin-top: 10px;" v-model="isContextChat"
                                active-color="#13ce66" active-text="开启连续对话" active-value=true inactive-value=false>
                            </el-switch>
                        </div>
                    </el-dialog>
                </div>
            </div>
        </el-main>
        <el-footer>
            <div v-loading="isLoading" element-loading-spinner="el-icon-loading"></div>
            <div class="input-box">
                <el-input v-model="inputValue" style="margin-left: 5px;" size="small" type="textarea" placeholder="请输入你的问题"
                    @keyup.enter.native="sendMessage" />
                <el-button size="small" icon="el-icon-search" circle @click="sendMessage" style="margin-left: 5px;"
                    :disabled="isLoading"></el-button>
            </div>
            <div class="audio-box">
                <el-button :class="[isRecording ? 'green-bg' : 'white-bg']" size="small" icon="el-icon-microphone" circle
                    @click="startRecordAudio" :disabled="isRecording">
                </el-button>
                <el-button icon="el-icon-turn-off-microphone" size="small" style="margin-left: 5px;" circle
                    @click="stopRecordAudio" :disabled="!isRecording"></el-button>
                <el-button style="border: none;font-size: 35px;padding:10px" @click="toggleAudio" :disabled="!audio">
                    <i v-if="isPlaying" class="el-icon-video-pause"></i>
                    <i v-else class="el-icon-video-play"></i>
                </el-button>
                <el-button icon="el-icon-refresh" circle style="margin-left: 5px;" size="small" @click="deleteChatHistory">
                </el-button>
                <el-button icon="el-icon-setting" circle size="small" @click="settingsVisible = true"></el-button>
            </div>
        </el-footer>
    </el-container>
</template>
<script>
import axios from 'axios';
import Recorder from 'js-audio-recorder';


export default {
    name: 'ChatBox',
    data() {
        return {
            messageHistory: [{ sender: "assistant", message: "Hi Stark,I am Jarvis ", time: new Date() }],
            inputValue: '',
            isContextChat: false,
            isLoading: false,
            isRecording: false,
            isPlaying: false,
            settingsVisible: false,
            balanceVisible: false,
            audio: null,
            audioUrl: '',
            tts: '',
            language: '',
            recorder: null,
            apiKey: '',
            maxTokens: '',
            total: '',
            usage: '',
            balance: '',
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
        })



    },
    methods: {
        //查询余额
        getBalance() {
            try {
                const url = `http://192.168.100.204:8080/getBalance`;
                axios.post(url, {
                    apiKey: this.apiKey
                }).then(response => {
                    this.total = response.data.total;
                    this.usage = response.data.usage;
                    this.balance = response.data.balance;
                    this.balanceVisible = true;
                });
            }
            catch (error) {
                this.$message.error('余额查询出错');
            }


        },
        // 发送消息
        sendMessage() {
            if (this.inputValue) {
                // 添加用户发送的消息到聊天记录
                const userMessage = { message: this.inputValue, sender: "user", time: new Date() };
                this.messageHistory.push(userMessage);
                // 发送请求获取机器人回复
                this.getRobotReply();
                // 清空输入框
                this.inputValue = '';
            }
        },
        //  获取机器人回复
        async getRobotReply() {
            try {
                this.isLoading = true; // 显示加载提示
                const url = `http://192.168.100.204:8080/chat`;
                console.log("isContextChat:" + this.isContextChat)
                const response = await axios.post(url, {
                    messageHistory: this.messageHistory,
                    isContextChat: this.isContextChat,
                    apiKey: this.apiKey,
                    maxTokens: this.maxTokens

                });
                console.log(response);
                // 添加机器人回复到聊天记录
                const aiMessage = {
                    message: response.data.data,
                    sender: "assistant",
                    time: new Date()
                };
                this.messageHistory.push(aiMessage);
                this.tts = aiMessage.message;
                //当选择语言时才调用文字转语音服务
                if (this.language) {
                    this.generateAudio();
                    this.playAudio();
                }else{
                    this.isLoading = false; // 隐藏加载提示
                }
                
            } catch (error) {
                this.$message.error('请求ChatGpt服务器超时');
                console.log(error);
                this.isLoading = false; // 隐藏加载提示
            }
        },
        //清空缓存
        deleteChatHistory() {
            //清空聊天记录
            this.messageHistory = [];
            //清空语音
            this.audio = null;
            //取消语音选择
            this.language = '';
            //清空输入框
            this.inputValue = '';
            const userMessage = { sender: "assistant", message: "Hi Stark,I am Jarvis ", time: new Date() };
            this.messageHistory.push(userMessage);
        },

        //开始录音
        startRecordAudio() {
            if (this.language) {
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
            formData.append('lang', this.language);
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
                    language: this.language
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
        }
    }
};
</script>
<style>
.chat-box {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    /* 左对齐 */
    max-width: 80%;

    margin: 0 auto;
    padding: 20px;
    background-color: #f7f7f7;
    border-radius: 10px;
    margin-bottom: auto;

    max-height: 500px;
    /* 设置最大高度 */
    overflow-y: auto;
    /* 超出高度时显示纵向滚动条 */

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

.el-main {

    margin-top: 80px;
    flex-grow: 1;
    overflow-y: auto;
    /* 添加此行，内容溢出时自动出现滚动条 */
    margin-bottom: 5px;
}

.el-header {
    position: fixed;
    top: 20px;
    width: 100%;
    z-index: 999;
}

.el-footer {
    display: flex;
    flex-direction: column;

    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    /* 添加此行，让footer与.chat-box之间有一定距离 */
    position: fixed;
    bottom: 20px;
    left: 0;
    width: 100%;
}

.loading {
    margin-bottom: 5px;
}

.el-container {
    display: flex;
    flex-direction: column;
    min-height: 100%;

}

.green-bg {
    margin-left: 5px;
    background-color: #13ce66;
}

.white-bg {
    margin-left: 5px;
    background-color: white;
}
</style>