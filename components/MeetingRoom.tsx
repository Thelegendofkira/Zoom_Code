import { CallControls,CallingState,CallParticipantsList,PaginatedGridLayout,SpeakerLayout, useCallStateHooks } from "@stream-io/video-react-sdk";
import { LayoutListIcon,LoaderIcon,UsersIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";

function MeetingRoom(){
    const router=useRouter();
    const[layout,setLayout]=useState<"speaker"|"grid">("speaker");
    const [showParticipants,setShowParticipant]=useState(false);
    const {useCallCallingState}=useCallStateHooks();

    const callingstate=useCallCallingState();

    if(callingstate!=CallingState.JOINED){
        return(
            <div className="h-96 flex items-center justify-center">
                <LoaderIcon className="size-6 animate-spin"/>
            </div>
        )
    }
    return(
        <div className="h-[calc(100vh-4rem-1px)]">
<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={35} minSize={25} maxSize={100} className="relative" >
    <div className="absolute inset-0">
        {layout==="grid"?<PaginatedGridLayout/>:<SpeakerLayout/>}

        {showParticipants&&(
            <div className="absolute right-0 top-0 h-full w-300px bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">

                <CallParticipantsList onClose={()=>setShowParticipant(false)}/>
            </div>
        )}
    </div>
    <div className="absolute bottom-4 left-0 right-0">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 flex-wrap justify-center px-4">
                <CallControls onLeave={() => router.push("/")} />

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="size-10">
                        <LayoutListIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setLayout("grid")}>
                        Grid View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLayout("speaker")}>
                        Speaker View
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="outline"
                    size="icon"
                    className="size-10"
                    onClick={() => setShowParticipant(!showParticipants)}
                  >
                    <UsersIcon className="size-4" />
                  </Button>

                 <p>end call button</p>
                </div>
              </div>
            </div>
          </div>
  </ResizablePanel>
  <ResizableHandle withHandle/>
  <ResizablePanel defaultSize={65} minSize={25}>code editor</ResizablePanel>
</ResizablePanelGroup>

        </div>
    )

}
export default MeetingRoom;