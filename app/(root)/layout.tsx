import StreamVideoProvider from "@/components/providers/streamprovider"

export default function Layout({children}:{children:React.ReactNode}){
    return <StreamVideoProvider>{children}</StreamVideoProvider>
}