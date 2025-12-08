import { useUser } from "@clerk/nextjs";

import { useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useMutation,useQuery } from "convex/react";
import { useState } from "react";
import { api } from "@/convex/_generated/api";
import toast from "react-hot-toast"

import { Dialog,DialogHeader,DialogTitle,DialogTrigger,DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select,SelectContent,SelectItem,SelectValue,SelectTrigger } from "@/components/ui/select";
import UserInfo from "@/components/Userinfo";
import { Loader2Icon,XIcon } from "lucide-react";
import { TIME_SLOTS } from "@/constants";
import MeetingCard from "@/components/MeetingCard";
import { Calendar } from "@/components/ui/calendar";

import React from 'react'

function InterviewScheduleUI() {
    const client=useStreamVideoClient();
    const {user}=useUser();
    const [open,setOpen]=useState(false);
    const [isCreating,setIsCreating]=useState(false);

    const interviews=useQuery(api.interviews.getAllInterviews);
    const users=useQuery(api.users.getUsers)??[];
    const createInterview=useMutation(api.interviews.createInterview);
    const candidates=users?.filter((u)=>{
        return u.role==="candidate"
    })
    const interviewers=users?.filter((u)=>u.role==="interviewer")
   
    const [fromData,setFromData]=useState({
        title:"",
        description:"",
        date:new Date(),
        time:"09:00",
        candidateId:"",
        interviewerIds:user?.id?[user.id]:[],
    })
    const scheduleMeeting=async()=>{
        if(!client||!user)return;
        if(!fromData.candidateId||fromData.interviewerIds.length===0){
            toast.error("please select both candiadte and interviewer for the interview");
            return;
        }
        setIsCreating(true);
        try{
            //create a call
            //craete a meeting and strore in data base
            const {title,description,date,time,candidateId,interviewerIds}=fromData;
            const [hours,minutes]=time.split(":");
            const meetingDate=new Date(date);
            meetingDate.setHours(parseInt(hours),parseInt(minutes),0);
            const id=crypto.randomUUID();
            const call = client.call("default", id);
             
            await call.getOrCreate({
                 data: {
          starts_at: meetingDate.toISOString(),
          custom: {
            description: title,
            additionalDetails: description,
          },
        },
            })
            await createInterview({
                title,
                description,
                startTime:meetingDate.getTime(),
                status:"upcoming",
                streamCallId:id,
                candidateId,
                interviewerIds,

            });
            setOpen(false);
            toast.success("meeting successfully scheduled");

            setFromData({
                 title: "",
        description: "",
        date: new Date(),
        time: "09:00",
        candidateId: "",
        interviewerIds: user?.id ? [user.id] : [],
            })

        }
        catch(error){
            console.log(error);
            toast.error("failed to schedule a meeting");
        }
        finally{
            setIsCreating(false);
        }
    }
    const addInterviews=(interviewerId:string)=>{
        if(!fromData.interviewerIds.includes(interviewerId)){
            setFromData((prev)=>({
                ...prev,
                interviewerIds:[...prev.interviewerIds,interviewerId],
            }))
        }
    }
    const removeInterviewer=(interviewerId:string)=>{
        if(interviewerId===user?.id)return;
        setFromData((prev)=>({
            ...prev,
            interviewerIds:prev.interviewerIds.filter((id)=>id!=interviewerId),
        }))
    }
    const selectInterviewers=interviewers.filter((i)=>fromData.interviewerIds.includes(i.clerkId))

    const avaiableInterviews=interviewers.filter((i)=>!fromData.interviewerIds.includes(i.clerkId))
    
 return (
  <div className="container mx-auto max-w-7xl  space-y-8 p-6 ">
    <div className="flex justify-between items-center">
        <div>
        <h1 className="text-3xl font-bold">Interviews</h1>
        <p className="text-muted-foreground mt-1">Schedule Meeting</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="lg">Schedule Meeting</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] h-[calc(100vh-200px)] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Schedule Interview</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2"> 
                        <label className="text-sm font-medium">Title</label>
                    <Input
                    placeholder="Interview title"
                    value={fromData.title}
                    onChange={(e)=>setFromData({...fromData,title:e.target.value})}
                    />
                    </div>
                     <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Interview description"
                  value={fromData.description}
                  onChange={(e) => setFromData({ ...fromData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Candidate</label>
                <Select value={fromData.candidateId} onValueChange={(candidateId)=>setFromData({...fromData,candidateId})}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select candidate" />
                    </SelectTrigger>
                    <SelectContent>
                        {candidates.map((candidate)=>{
                            return(
                                <SelectItem key={candidate.clerkId} value={candidate.clerkId}>
                                    <UserInfo user={candidate}/>
                                </SelectItem>
                            )
                        })}
                    </SelectContent>
                </Select>

              </div>
                            <div className="space-y-2">
                <label className="text-sm font-medium">Interviewers</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectInterviewers.map((interviewer) => (
                    <div
                      key={interviewer.clerkId}
                      className="inline-flex items-center gap-2 bg-secondary px-2 py-1 rounded-md text-sm"
                    >
                      <UserInfo user={interviewer} />
                      {interviewer.clerkId !== user?.id && (
                        <button
                          onClick={() => removeInterviewer(interviewer.clerkId)}
                          className="hover:text-destructive transition-colors"
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {avaiableInterviews.length > 0 && (
                  <Select onValueChange={addInterviews}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add interviewer" />
                    </SelectTrigger>
                    <SelectContent>
                      {avaiableInterviews.map((interviewer) => (
                        <SelectItem key={interviewer.clerkId} value={interviewer.clerkId}>
                          <UserInfo user={interviewer} />
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
               <div className="flex gap-4">
             
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Calendar
                    mode="single"
                    selected={fromData.date}
                    onSelect={(date) => date && setFromData({ ...fromData, date })}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

              

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time</label>
                  <Select
                    value={fromData.time}
                    onValueChange={(time) => setFromData({ ...fromData, time })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_SLOTS.map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>


              
<div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={scheduleMeeting} disabled={isCreating}>
                  {isCreating ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    "Schedule Interview"
                  )}
                </Button>
              </div>
                </div>

            </DialogContent>

        </Dialog>
    </div>
    {!interviews?(<div className="flex justify-center py-12">
        <Loader2Icon className=" size-8 animation-spin"/>
    </div>):interviews.length>0?( <div className="spacey-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {interviews.map((interview) => (
              <MeetingCard key={interview._id} interview={interview} />
            ))}
          </div>
        </div>):
    (  <div className="text-center py-12 text-muted-foreground">No interviews scheduled</div>)}
  </div>
  );
}

export default InterviewScheduleUI
