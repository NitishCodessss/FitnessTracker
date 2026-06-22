import { createContext, useContext, useEffect, useState } from 'react';
import { initialState, type ActivityEntry, type Credentials, type FoodEntry, type User } from '../types';
import { useNavigate } from 'react-router';
import mockApi from '../assets/mockApi';

const AppContext = createContext(initialState);

const AppProvider = ({ children }: { children: React.ReactNode }) =>{

    const navigate = useNavigate();
    const [user, setUser] = useState<User>(null);
    const [isUserFetched, setIsUserFetched] = useState(false);
    const [onBoardingCompleted, setOnBoardingCompleted] = useState(false);
    const [allFoodsLogs, setAllFoodsLogs] = useState<FoodEntry[]>([]);
    const [allActivityLogs, setAllActivityLogs] = useState<ActivityEntry[]>([]);
 
    const signup = async (credentials: Credentials) => {
        const {data} = await mockApi.auth.register(credentials);
        setUser(data.user);
        if(data?.user?.age && data?.user?.weight && data?.user?.goal){
            setOnBoardingCompleted(true);
        }
        localStorage.setItem('token', data.jwt);
    }

    const login = async (credentials: Credentials) => {
        const {data} = await mockApi.auth.login(credentials);
        setUser({...data.user, token: data.jwt});
        if(data?.user?.age && data?.user?.weight && data?.user?.goal){
            setOnBoardingCompleted(true);
        }
    };

    const fetchUser = async () => {
        const {data} = await mockApi.user.me();
        setUser({...data, token});
        if(data?.age && data?.weight && data?.goal){
            setOnBoardingCompleted(true);
        }
        setIsUserFetched(true);
    }

    const fetchFoodLogs = async () => {
        const {data} = await mockApi.foodLogs.list();
        setAllFoodsLogs(data);
    }

    const fetchActivityLogs = async () => {
        const {data} = await mockApi.activityLogs.list();
        setAllActivityLogs(data);
    }
    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setOnBoardingCompleted(false);
        navigate('/');
    }

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token){
            (async () => {
                await fetchUser();
                await fetchFoodLogs();
                await fetchActivityLogs();
            })();
                 
        }else{
            setIsUserFetched(true);
        }

    },[])

    const value ={
        user, setUser, signup, login, logout,
        onBoardingCompleted, setOnBoardingCompleted, allFoodsLogs,
        allActivityLogs, fetchFoodLogs, fetchActivityLogs, isUserFetched
    }
    return (<AppContext.Provider value = {value}>
        {children}
    </AppContext.Provider>)
}

export const useAppContext = () => useContext(AppContext);