export class MemberObject {
    readonly _id: string;
    private _name: string;
    private _email: string;

    constructor(id: string, name: string, email: string) {
        this._id = id;
        this._name = name;
        this._email = email;
    }

    // Getter and Setter for name
    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    // Getter and Setter for email
    get email(): string {
        return this._email;
    }

    set email(email: string) {
        this._email = email;
    }
}

export class TeamObject {
    readonly _id: string;
    private _name: string;
    private _members: MemberObject[];
    private _documents: string[];

    constructor(id: string, name: string, members: MemberObject[], documents: string[]) {
        this._id = id;
        this._name = name;
        this._members = members;
        this._documents = documents;
    }

    // Getter and Setter for name
    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }

    // Getter and Setter for members
    get members(): MemberObject[] {
        return this._members;
    }

    set members(members: MemberObject[]) {
        this._members = members;
    }

    // Getter and Setter for documents
    get documents(): string[] {
        return this._documents;
    }

    set documents(documents: string[]) {
        this._documents = documents;
    }

    // Remove a document if it exists
    removeDocuments(document: string): void {
        const index = this._documents.indexOf(document);
        if (index > -1) {
            this._documents.splice(index, 1);
        }
    }

    // Add a document if it does not already exist
    addDocument(document: string): void {
        if (!this._documents.includes(document)) {
            this._documents.push(document);
        }
    }

    // Remove a member based on email equality
    removeMember(member: MemberObject): void {
        this._members = this._members.filter(m => m.email !== member.email);
    }

    // Add a member if not already present
    addMember(member: MemberObject): void {
        if (!this._members.some(m => m.email === member.email)) {
            this._members.push(member);
        }
    }
}
