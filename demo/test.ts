interface User {
    id: number;
    name: string;
    email: string;
    createdAt: Date;
}

type UserRole = 'admin' | 'user' | 'guest';

enum Status {
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
    Pending = 'PENDING'
}

namespace UserUtils {
    export function validateEmail(email: string): boolean {
        return email.includes('@');
    }
}

abstract class BaseService {
    protected abstract endpoint: string;
    
    public async fetchData(): Promise<any> {
        const response = await fetch(this.endpoint);
        return response.json();
    }
}

class UserService extends BaseService implements ServiceInterface {
    protected endpoint = '/api/users';
    private readonly users: User[] = [];

    public async getUsers(): Promise<User[]> {
        const data = await this.fetchData();
        return data.filter((user: User) => user.name.includes('John'));
    }

    private validateUser(user: User): boolean {
        return UserUtils.validateEmail(user.email);
    }
}

interface ServiceInterface {
    getUsers(): Promise<User[]>;
}