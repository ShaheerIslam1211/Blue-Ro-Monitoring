import { userAtom } from "@/store/atoms/userAtom";
import { getDefaultStore } from "jotai";

export function whoami() {
    try{

        const user = getDefaultStore().get(userAtom);
        if(user) {
            if(user.acc==="super_admin")return "super_admin";
        }else if(user.clientIds?.length>0){
            return "client_admin";
        }else if(user.regionIds?.length>0){
            return "region_admin";
        }
        return "default";
    }catch(e){
        return "default";
    }
}