<template>
    <el-container>
        <el-header>
            <img src="/images/logo.png" alt=""
                style="width: 100px; height: 100px; border-radius: 50%; margin-bottom: 10px;">
            <!-- <span style="margin-top: 5px;">Jarvis</span> -->
        </el-header>
        <el-main>
            <!-- <div v-loading="isLoading"  element-loading-spinner="el-icon-loading">Loading...</div> -->
            <div class="chat-box">
                <div v-for="item in messageHistory" :key="item"
                    style="display: flex; align-items: flex-start;text-align: left;">
                    <img :src="item.sender === 'assistant' ? '/images/ai.png' : '/images/user.png'" alt=""
                        style="width: 30px; height: 30px; margin-right: 10px;">
                    <div v-text=item.message style="white-space: pre-line;"></div>
                </div>
            </div>
            <div v-loading="isLoading" element-loading-spinner="el-icon-loading"></div>
        </el-main>
        <el-footer>
            <div class="input-box">
                <el-input v-model="inputValue" size="small" type="textarea" placeholder="请输入你的问题"
                    @keyup.enter.native="sendMessage" />
                <el-button size="small" icon="el-icon-search" circle @click="sendMessage" style="margin-left: 5px;"
                    :disabled="isLoading"></el-button>

                <el-switch size="mini" style="display: block;margin-left: 5px;" v-model="isContextChat"
                    active-color="#13ce66" active-value=true inactive-value=false>
                </el-switch>
                <el-button size="small" icon="el-icon-delete" circle @click="deleteChatHistory"
                    style="margin-left: 10px;"></el-button>
            </div>
        </el-footer>
    </el-container>
</template>
<script>
import axios from 'axios';
export default {
    name: 'ChatBox',
    data() {
        return {
            messageHistory: [{ sender: "assistant", message: "Hi Stark,I am Jarvis ", time: new Date() }],
            inputValue: '',
            isContextChat: false,
            isLoading: false,
        };
    },
    methods: {
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
                const url = `http://192.168.100.206:8080/chat`;
                console.log("isContextChat:" + this.isContextChat)
                const response = await axios.post(url, {
                    messageHistory: this.messageHistory,
                    isContextChat: this.isContextChat
                });

                console.log(response.data.data);
                // 添加机器人回复到聊天记录
                const aiMessage = {
                    message: response.data.data,
                    sender: "assistant",
                    time: new Date()
                };
                this.messageHistory.push(aiMessage);

            } catch (error) {

                this.$message.error('请求ChatGpt服务器超时');
                console.log(error);
            } finally {
                this.isLoading = false; // 隐藏加载提示
            }
        },
        //清空聊天记录
        deleteChatHistory() {
            this.messageHistory = [];
            const userMessage = { sender: "assistant", message: "Hi Stark,I am Jarvis ", time: new Date() };
            this.messageHistory.push(userMessage);
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

    max-height: 550px;
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
</style>