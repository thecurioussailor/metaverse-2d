import WebSocket from "ws";
import { RoomManager } from "./RoomManager";
import { OutgoingMessage } from "./types";
import client from "@repo/db/client";
function getRandomString(length: number){
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for(let i = 0; i < length; i++){
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result;
}
export class User{
    public id: string;
    private spaceId?: string;
    private x?: number;
    private y?: number; 
    constructor(private ws: WebSocket){
        this.id = getRandomString(10);
    }

    initHandlers(){
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(data.toString());
            switch(parsedData.type){
                case "join": {
                    const spaceId = parsedData.payload.spaceId;
                    const space = await client.space.findFirst({
                        where: {
                            id: spaceId
                        }
                    })
                    if(!space){
                        this.ws.close();
                        return;
                    }
                    this.spaceId = spaceId;
                    RoomManager.getInstance().addUser(spaceId, this);
                    this.x = Math.floor(Math.random() * space?.width);
                    this.y = Math.floor(Math.random() * space?.height);
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                               
                            },
                            users: RoomManager.getInstance().rooms.get(spaceId)?.map((u) => ({id: u.id}))
                        }
                    })
                    RoomManager.getInstance().broadcast({
                        type: "user-joined",
                        payload: {
                            userId: this.id,
                            x: this.x,
                            y: this.y
                        }
                    }, this, this.spaceId!)
                }
                break;
                case "move": {
                    const moveX = parsedData.payload.x;
                    const moveY = parsedData.payload.y;
                    const xDisplacement = Math.abs(this.x! - moveX);
                    const yDisplacement = Math.abs(this.y! - moveY);

                    if(xDisplacement == 1 && yDisplacement == 0 || (xDisplacement == 0 && yDisplacement == 1)){
                        this.x = moveX;
                        this.y = moveY;
                        RoomManager.getInstance().broadcast({
                            type: "move",
                            payload: {
                                x: this.x,
                                y: this.y
                            }
                        }, this, this.spaceId!);
                        return;
                    }
                    this.send({
                        type: "movement-rejected",
                        payload: {
                            x: this.x,
                            y: this.y
                        }
                    });
                }
            }
        })
    }
    destroy(){
        RoomManager.getInstance().broadcast({
            type: "user-left",
            payload: {
                userId: this.id
            }
        }, this, this.spaceId!)
        RoomManager.getInstance().removeUser(this, this.spaceId!);
    }
    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload));
    }
}