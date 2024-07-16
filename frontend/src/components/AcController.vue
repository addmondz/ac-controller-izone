<template>
    <div class="container w-100 h-100 d-flex justify-content-center align-items-center" style="min-height: 80vh;">
        <div v-if="isInitialLoading" class="loading-container">
            <div class="spinner"></div>
            <p class="mt-3">Loading...</p>
        </div>
        <div v-else>
            <div class="ac-controller">
                <div class="display">
                    <div class="lcd w-100 d-flex justify-content-center align-items-center" :class="{ on: isOn }">
                        <!-- <div class="operation-lamp" :class="{ on: isOn }"></div> -->
                        <span class="status-text">{{ display }}</span>
                    </div>
                </div>

                <div class="row">
                    <div class="col">
                        <div class="d-flex justify-content-center align-items-center flex-column h-100">
                            <button @click="changeSetting('power')"
                                class="button w-100 h-100"><span>Power</span></button>
                        </div>
                    </div>
                    <div class="col">
                        <div class="d-flex justify-content-center align-items-center flex-column h-100">
                            <button @click="changeSetting('incrementTemp')" class="button h-50 w-100">▲</button>
                            <button @click="changeSetting('decrementTemp')" class="button h-50 w-100">▼</button>
                        </div>
                    </div>
                    <div class="col">
                        <div class="d-flex justify-content-center align-items-center flex-column h-100">
                            <button @click="changeSetting('mode')" class="button w-100">Mode</button>
                            <button @click="changeSetting('fanSpeed')" class="button w-100">Fan</button>
                        </div>
                    </div>
                </div>
                <div v-if="loading" class="status-message loading">{{ message = 'Loading...' }}</div>
                <div v-else-if="success" class="status-message success">{{ message = 'Success!' }}</div>
                <div v-else-if="error" class="status-message error">{{ message = error }}</div>
                <div v-else class="status-message success">&nbsp;</div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            isOn: false,
            mode: 'COOL',
            fanSpeed: 'AUTO',
            temperature: 22,
            display: '',
            loading: false,
            isInitialLoading: true,
            success: false,
            error: '',
            modes: ['COOL', 'HEAT', 'VENT', 'DRY'],
            fanSpeeds: ['LOW', 'MEDIUM', 'HIGH', 'AUTO'],
        };
    },
    methods: {
        async changeSetting(setting) {
            this.loading = true;
            this.success = false;
            this.error = '';

            try {
                switch (setting) {
                    case 'power':
                        this.isOn = !this.isOn;
                        await this.callApi({ SysOn: this.isOn ? 1 : 0 });
                        break;
                    case 'mode':
                        this.mode = this.modes[(this.modes.indexOf(this.mode) + 1) % this.modes.length];
                        await this.callApi({ SysMode: this.modes.indexOf(this.mode) + 1 });
                        break;
                    case 'fanSpeed':
                        this.fanSpeed = this.fanSpeeds[(this.fanSpeeds.indexOf(this.fanSpeed) + 1) % this.fanSpeeds.length];
                        await this.callApi({ SysFan: this.fanSpeeds.indexOf(this.fanSpeed) + 1 });
                        break;
                    case 'incrementTemp':
                        if (this.temperature < 30) this.temperature++;
                        await this.callApi({ SysSetpoint: this.temperature * 100 });
                        break;
                    case 'decrementTemp':
                        if (this.temperature > 15) this.temperature--;
                        await this.callApi({ SysSetpoint: this.temperature * 100 });
                        break;
                }
                this.updateDisplay();
                this.success = true;
            } catch (error) {
                this.error = `Something went wrong: ${error.message}`;
            } finally {
                this.loading = false;
            }
        },
        async callApi(payload) {
            try {
                await axios.post('http://localhost:3000/api/control-ac', payload);
            } catch (error) {
                console.error(`Error changing setting: ${error}`);
                throw error;
            }
        },
        async fetchInitialSettings() {
            this.success = false;
            this.error = '';

            try {
                const response = await axios.post('http://localhost:3000/api/control-ac', {
                    "iZoneV2Request": {
                        "Type": 1,
                        "No": 0,
                        "No1": 0
                    }
                });
                const { Setpoint, SysFan, SysMode, SysOn } = response.data;

                this.temperature = Setpoint / 100;
                this.fanSpeed = this.fanSpeeds[SysFan - 1];
                this.mode = this.modes[SysMode - 1];
                this.isOn = SysOn === 1;

                this.updateDisplay();
            } catch (error) {
                this.error = `Failed to fetch settings: ${error.message}`;
            } finally {
                this.isInitialLoading = false;
            }
        },
        updateDisplay() {
            this.display = `${this.isOn ? 'ON' : 'OFF'} | ${this.mode} | ${this.fanSpeed} | ${this.temperature}°C`;
        },
    },
    mounted() {
        this.fetchInitialSettings();
    },
};
</script>

<style scoped>
.ac-controller {
    width: 350px;
    margin: auto;
    text-align: center;
    border: 1px solid #ccc;
    padding: 20px;
    background-color: #f0f0f0;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.display {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
}

.lcd {
    background-color: #e0e0e0;
    padding: 15px;
    border-radius: 8px;
    gap: 10px;
    transition: background-color 0.3s, transform 0.1s;
}

.lcd.on {
    background-color: rgb(0, 123, 255, 0.4);
}

.operation-lamp {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background-color: red;
    transition: background-color 0.3s;
}

.operation-lamp.on {
    background-color: green;
}

.status-text {
    font-size: 1.1em;
    font-weight: bold;
}

.button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px;
    margin: 5px;
    width: 70px;
    border: none;
    border-radius: 8px;
    background-color: #007bff;
    color: white;
    font-size: 1em;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.1s;
}

.button:hover {
    background-color: #0056b3;
}

.button:active {
    transform: scale(0.98);
}

.status-message {
    margin-top: 10px;
    font-weight: bold;
    font-size: 1.1em;
}

.status-message.loading {
    color: #007bff;
}

.status-message.success {
    color: #007bff;
}

.status-message.error {
    color: #dc3545;
}

.loading-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.spinner {
    border: 8px solid #f3f3f3;
    /* Light grey */
    border-top: 8px solid #007bff;
    /* Blue */
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.h-100 {
    height: 100%;
}

.h-50 {
    height: 50%;
}

.w-100 {
    width: 100%;
}
</style>
