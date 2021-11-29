import React, {Component, CSSProperties, useState} from 'react';
import plus from './plus.png';
import close from './close.png';
import like from './like.png';
import success from './success.png';
import trash from './trash.png';
import Modal from 'react-modal';
import fetchRequest from "./fetchRequest";

// @ts-ignore
import { io } from "socket.io-client";
const socket = io("http://localhost:3003", {
});

export enum WSEventes {
  CREATE_TASK= 'CREATE_TASK',
  MARK_DONE = 'MARK_DONE',
  DELETE_TASK = 'DELETE_TASK'
}

const styles= {
  taskStyle: {
    width: '220px',
    height: '220px',
    display:'flex',
    borderRadius: '25px',
    flexDirection: 'column',
    alignItems:'center',
    backgroundColor: '#b7c6b3',
    color: '#123123',
    fontWeight: '500',
    fontSize: '18px'
  },
  textStyle: {
    color: '#77c3a1',
    fontWeight: '500',
    fontSize: '28px',
  },

  roundButton: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding:'12px',
    borderRadius: '25px',
    backgroundColor: '#4c563d',
  },

  addButton: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    padding:'12px',
    borderRadius: '25px',
    backgroundColor: '#4c563d',
    marginLeft: '25px'
  },
  button: {
    fontWeight: '500',
    color: '#34c384',
    backgroundColor: '#123123',
    width: '100px',
    height: '30px',
    borderRadius: '12px',
    textAlign: "center",
    marginTop: '25px',
    border: 'none'
  },
  textInput: {
    fontWeight: '500',
    color: '#34c384',
    backgroundColor: '#123123',
    width: '150px',
    height: '30px',
    borderRadius: '12px',
    marginTop: '25px',
    padding: '5px',
    fontSize: '18px',
    border: 'none'
  }

}

const generateRandomId = () => {
  return Math.floor(Math.random() * 1000) + Math.floor(Math.random() * 1000)
}

class TaskModel {
  id: number;
  label: string;
  body: string;
  done: boolean;
  createdAt: Date;

  constructor(id: number, label: string, body: string, done: boolean, createdAt: Date) {
    this.id = id;
    this.label = label;
    this.body = body;
    this.done = done;
    this.createdAt = createdAt;
  }

}



class Task extends Component<any, any> {
  render() {
    const {label, body, done, id} = this.props.task;
    return (<div style={styles.taskStyle as CSSProperties}>
      <div>
        <img src={trash} style={{width: '25px', height: '25px', position: 'relative', left: -80, top: 10}}
             onClick={() => {
               this.props.removeTask(id)
             }}/>
        <img src={done ? close :success} style={{width: '25px', height: '25px', position: 'relative', right: -80, top: 10}}
             onClick={() => {
               this.props.markDone(id)
             }}/>
      </div>
      <p>{label}</p>
      <p>{body}</p>
      <img src={like} style={{
        transform: done ? '' : 'rotateX(180deg)',
        width: '25px', height: '25px'}}
           onClick={() => {

           }}/>
      <p>{done ? 'Сделано' : 'Не сделано'}</p>
    </div>);
  }
}

const ModalForm = (props: any) => {

  const [label, setLabel] = useState('')
  const [body, setBody] = useState('')

  return (  <div style={{display:'flex', flexDirection:'column', backgroundColor: '#58a482', padding:'12px', alignItems:'center'}}>
    <img
        style={{width:'50px', height:'50px', marginBottom: '25px'}}
        src={close}
        onClick={() => {
          props.exitForm()
        }}/>
    <input placeholder={"Название"} style={styles.textInput as CSSProperties} value={label} onChange={(e) => {setLabel(e.target.value)}}/>
    <input placeholder={"Описание"} style={styles.textInput as CSSProperties} value={body} onChange={(e) => {setBody(e.target.value)}}/>
    <button
        style={styles.button as CSSProperties}
        onClick={() => {
          props.createTask(label, body)
        }}>Создать</button>
  </div>)
}


interface State{
  tasks: TaskModel[];
  isCreateTaskModelOpen: boolean;
}

class TaskList extends Component<any, State> {

  async getAllTasks() {
    return fetchRequest('task/get-all',undefined, {},'GET')
  }

  async createTask(label: string, body: string){
    socket.emit(WSEventes.CREATE_TASK, {label,body})
  }

  removeTask(id: number){
    socket.emit(WSEventes.DELETE_TASK, {id})
    this.setState({
          tasks: this.state.tasks.filter(item => item.id !== id),
        })
  }

  markDone(id: number){
    const taskIndex = this.state.tasks.findIndex(item => item.id === id)
    const markBoolean =  !this.state.tasks[taskIndex].done;
    socket.emit(WSEventes.MARK_DONE, {id, done: markBoolean})
    this.state.tasks[taskIndex].done = markBoolean
    this.setState({
      tasks: [...this.state.tasks],
    })
  }

  editTask(){

  }

  state: State = {
    tasks : [],
    isCreateTaskModelOpen: false
  }

  componentDidMount() {

    socket.on(WSEventes.CREATE_TASK, (res) => {
      this.setState({
        tasks: [res, ...this.state.tasks],
        isCreateTaskModelOpen: false
      })
    })

    this.getAllTasks().then((tasks) => {
      console.log(tasks)
      this.setState({
      // @ts-ignore
        tasks,
        isCreateTaskModelOpen: false
      })
    })
  }

  createModal(){
    return (
        <Modal
            style={{
              content: {
                top: '60%',
                left: '50%',
                right: 'auto',
                marginRight: '-50%',
                transform: 'translate(-50%, -50%)',
              },
            }}
            isOpen={this.state.isCreateTaskModelOpen}
            contentLabel="Создать задачу"
        >
        <ModalForm
            exitForm={() => {
              this.setState({
                ...this.state,
                isCreateTaskModelOpen: false
              })
            }}
            createTask={(label: string, body: string) => {
              this.createTask(label, body)
        }} />
        </Modal>
    );
  }

  render() {
    return <div style={{ backgroundColor: '#4a5351', height:'100%'}}>
      {this.createModal()}
      <div style={{padding:'5px', width: '100%', height: '55px', backgroundColor: '#1c1c16',display: 'flex', alignItems:'center'}}>
        <div style={styles.textStyle as CSSProperties}>Список задач</div>
        <div style={styles.addButton as CSSProperties} onClick={() => {
          this.setState({
            ...this.state,
            isCreateTaskModelOpen: true
          })
        }}>
          <img style={{width:'25px', height: '25px'}} src={plus}/>
        </div>

      </div>
      <div style={{padding: '20px',
        display: 'grid',
        gridAutoColumns: '1fr',
        gridAutoRows: '1fr',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '10px 10px',
      }}>
        {this.state.tasks.map((item: any) => <Task task={item} removeTask={this.removeTask.bind(this)} markDone={this.markDone.bind(this)}/>)}
      </div>
    </div>;
  }

}

function App() {
  return ( <TaskList/>);
}

export default App;
