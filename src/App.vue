<script setup>
import { ref, reactive, onMounted } from 'vue';
import CryptoJS from "crypto-js";
import { ElMessage } from 'element-plus'
// 获取系统时间
import { systemTime, currentFee } from './api/common'
// 获取资产
import { balance, withdraw } from './api/user'

const rules = reactive({
  apiKey: [
    { required: true, message: 'apiKey不能为空', trigger: 'blur' },
  ],
  secretKey: [
    { required: true, message: 'secretKey不能为空', trigger: 'blur' },
  ],
  passPhrase: [
    { required: true, message: 'passPhrase不能为空', trigger: 'blur' },
  ],
})

const formRef = ref()

const infoData = reactive(
  {
    apiKey: '',
    secretKey: '',
    passPhrase: '',
  }
)

// 设置延时
const sleep = (ts) => new Promise((resolve) => setTimeout(() => resolve(), ts))

// 获取系统时间
const getSystemTime = async () => {
  try {
    const { code, data } = await systemTime()
    if (code === '0') {
      return new Date(Number(data[0].ts))
    }

  } catch (err) {
    console.log(err);
  }

}

// 获取当前gasfee
const getCurrentFee = async (ccy, apiKey, secretKey, passPhrase) => {
  try {
    const ts = await getSystemTime()
    const { code, data } = await currentFee(ts, ccy, apiKey, secretKey, passPhrase)
    if (code == '0') {
      return data

    }
  } catch (err) {
    console.log(err);

  }
}

// 资产列表

const userCoins = ref([])

// 获取资产
const getBalance = async (info) => {
  formRef.value.validate(async valid => {
    if (valid === false) return
    const ts = await getSystemTime()
    const { apiKey, secretKey, passPhrase } = infoData
    try {
      const { code, data } = await balance(ts, apiKey, secretKey, passPhrase)
      if (code == '0') {
        userCoins.value = data
      }
    } catch (err) {
      console.log(err);

    }
  })
}

// 币种列表
const coins = reactive([
  {
    label: 'BTC',
    value: 'BTC'
  },
  {
    label: 'ETH',
    value: 'ETH'
  },
  {
    label: 'MATIC',
    value: 'MATIC'
  },
  {
    label: 'BNB',
    value: 'BNB'
  },
])

const currentCoin = ref('BTC')
const currentChain = ref('BTC-Bitcoin')

// 初始化币种网络
// onMounted(async () => {
//   await getCoinChain()
// })

// 获取当前币种支持的网络

const coinChains = ref([])

const getCoinChain = async (coin = 'BTC') => {
  const { apiKey, secretKey, passPhrase } = infoData
  try {
    const ts = await getSystemTime()
    console.log(coin);
    
    const {code , data} = await currentFee(ts, coin, apiKey, secretKey, passPhrase)
    if (code == '0') {
      console.log(data);
      
      coinChains.value = data
      currentChain.value = data[0].chain
      console.log(data);

    }
    

  } catch (err) {
    console.log(err);

  }

}

// 提币地址列表
const addresses = ref('')

const addressLists = ref([])

// 地址列表格式化
const change = (value) => {
  // console.log(value.trim().split(/\n/));
  addressLists.value = value.trim().split(/\n/)
}

// 开始提币
const startWithDraw = async () => {
  const { apiKey, secretKey, passPhrase } = infoData
  const fee = await getCurrentFee(currentCoin.value, apiKey, secretKey, passPhrase)
  if (addressLists.value == []) return
  for (let i = 0; i < addressLists.value.length; i++) {
    const format = addressLists.value[i].split(',')
    const [address,  amt] = format

    const current = fee.filter(item => {      
      if (item.chain == currentChain.value) {
        return item
      }
    })
    // console.log(current);
    if (current.length === 0) {
      ElMessage({
        message: '请检查提币币种与所选币种是否一致',
        type: 'warning',
      })
      return
    }
    if (apiKey== ''|| secretKey == '' || passPhrase == '') {
      ElMessage({
        message: 'apiKey, secretKey, passPhrase 不能为空',
        type: 'warning',
      })
      return
    }


    const data = {
      ccy: currentCoin.value,
      amt,
      dest: 4,
      toAddr: address,
      fee: current[0].maxFee,
      chain: currentChain.value
    }

    try {
      const ts = await getSystemTime()
      const { code, msg } = await withdraw(ts, data, apiKey, secretKey, passPhrase)
      if (code == '0') {
        ElMessage({
          message: '提币申请已提交',
          type: 'success',
        })
      } else {
        ElMessage({
          message: msg,
          type: 'warning',
        })
      }
      await sleep(1500)

    } catch (err) {
      ElMessage({
        message: err.response.data.msg,
        type: 'error',
      })
      console.log(err.response);


    }
  }
}

</script>

<template>
  <div class="wrapper">
    <!-- <header>header</header> -->
    <main>
      <div class="card">
        <el-form ref="formRef" :model="infoData" :rules="rules" label-width="120px" class="demo-ruleForm" status-icon>
          <el-form-item label="apiKey" prop="apiKey">
            <el-input v-model="infoData.apiKey" />
          </el-form-item>
          <el-form-item label="secretKey" prop="secretKey">
            <el-input v-model="infoData.secretKey" />
          </el-form-item>
          <el-form-item label="passPhrase" prop="passPhrase">
            <el-input v-model="infoData.passPhrase" type="password" />
          </el-form-item>
          <el-form-item>
            <div class="get">
              <el-button type="primary" @click="getBalance(infoData)">
                获取资产
              </el-button>
            </div>
          </el-form-item>
        </el-form>
        <div class="user_balances">
          <el-table :data="userCoins" border style="width: 100%">
            <el-table-column prop="ccy" label="币种" />
            <el-table-column prop="availBal" label="数量" />
          </el-table>
        </div>
        <!-- 提币列表 -->
        <div class="withdraw">

          <!-- 选择币种 -->
          <el-select v-model="currentCoin" class="m-2" placeholder="Select" size="default" style="width: 240px"
            @change="getCoinChain">
            <el-option v-for="item in coins" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <!-- 选择网络 -->
          <el-select v-model="currentChain" class="m-2" placeholder="Select" size="default" style="width: 240px"
            >
            <el-option v-for="item in coinChains" :key="item.chain" :label="item.chain" :value="item.chain" />
          </el-select>

          <el-input v-model="addresses" style="margin-top: 20px;" type="textarea"
            placeholder="格式:地址,数量,例:0x1111111111111111,1" @change="change" />
           <el-tag type="primaary">共{{ addressLists.length }}个地址</el-tag>
          <footer><el-button type="primary" style="margin-top: 20px;" @click="startWithDraw">开始提币</el-button></footer>
        </div>
      </div>
    </main>
  </div>
</template>

<style lang="scss">
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.wrapper {
  display: flex;
  flex-direction: column;
  justify-content: center;

  main {
    padding: 20px;

    .card {
      width: 100%;
      max-width: 768px;
      border-radius: 10px;
      border: 1px solid #f1f1f1;
      padding: 20px;
      margin: 0 auto;

      .user_balances {
        margin: 20px 0;
      }

      @media (max-width: 848px) {
        max-width: 420px;
      }
    }
  }
}

.get {
  display: flex;
  width: 100%;
  justify-content: center;
}

footer {
  display: flex;
  justify-content: center;
}
</style>

<style scoped>
:deep().el-textarea__inner {
  min-height: 220px !important;
}

:deep().el-form-item__content {
  margin-left: 0 !important;
}
</style>
